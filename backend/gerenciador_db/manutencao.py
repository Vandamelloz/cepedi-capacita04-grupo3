from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from models.models import Manutencao, StatusManutencao, StatusEquipamento
from datetime import datetime

class ManutencaoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
        self.historico_repositorio = None

    def set_historico_repositorio(self, historico_repositorio):
        self.historico_repositorio = historico_repositorio

    async def _registrar_historico(self, id_equipamento: int, id_usuario_acao: int,
                                   status_anterior: str, status_novo: str, descricao: str):
        if self.historico_repositorio:
            from models.models import HistoricoMovimentacao
            historico = HistoricoMovimentacao(
                id_equipamento=id_equipamento,
                id_usuario_acao=id_usuario_acao,
                status_anterior=status_anterior,
                status_novo=status_novo,
                descricao_motivo=descricao
            )
            await self.historico_repositorio.registrar_movimentacao(historico)

    async def criar_manutencao(self, manutencao: Manutencao):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 🔴 Configura timeout reduzido para evitar lock
            cur.execute("SET innodb_lock_wait_timeout = 5")

            # Verifica equipamento
            cur.execute("SELECT status FROM equipamento WHERE id = %s", (manutencao.id_equipamento,))
            equipamento = cur.fetchone()
            if not equipamento:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            # Atualiza status do equipamento para EM_MANUTENCAO
            cur.execute("UPDATE equipamento SET status = 'EM_MANUTENCAO' WHERE id = %s", (manutencao.id_equipamento,))

            sql = """
                INSERT INTO manutencao 
                (id_equipamento, descricao_defeito, status, data_abertura) 
                VALUES (%s, %s, %s, NOW())
            """
            cur.execute(sql, (
                manutencao.id_equipamento,
                manutencao.descricao_defeito,
                manutencao.status.value
            ))
            con.commit()

            id_gerado = cur.lastrowid

            # Registra histórico (fora da transação principal)
            await self._registrar_historico(
                id_equipamento=manutencao.id_equipamento,
                id_usuario_acao=1,
                status_anterior=equipamento['status'],
                status_novo=StatusEquipamento.EM_MANUTENCAO.value,
                descricao=f"Manutenção aberta - ID: {id_gerado}"
            )

            return {
                "sucesso": True,
                "mensagem": "Manutenção criada com sucesso",
                "id": id_gerado
            }
        except HTTPException:
            raise
        except Exception as e:
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    async def listar_manutencoes(self):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 🔴 Configura timeout reduzido
            cur.execute("SET innodb_lock_wait_timeout = 5")

            sql = """
                SELECT m.*, eq.nome as nome_equipamento 
                FROM manutencao m
                INNER JOIN equipamento eq ON m.id_equipamento = eq.id
                ORDER BY m.data_abertura DESC
            """
            cur.execute(sql)
            manutencoes = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(manutencoes),
                "manutencoes": manutencoes
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    async def atualizar_manutencao(self, manutencao_id: int, manutencao: ManutencaoUpdate):
        """Atualiza uma manutenção existente (aceita atualização parcial)."""
        con = None
        cur = None
        try:
            # ABRE CONEXÃO COM TIMEOUT REDUZIDO
            con = pymysql.connect(
                **self.config_db,
                connect_timeout=5,
                read_timeout=10,
                write_timeout=10
            )
            cur = con.cursor()
            
            # Configura timeout do InnoDB
            cur.execute("SET innodb_lock_wait_timeout = 5")
            
            # Inicia transação com isolamento READ COMMITTED
            cur.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")

            # 1. Verifica se a manutenção existe
            cur.execute("""
                SELECT id, id_equipamento, status 
                FROM manutencao 
                WHERE id = %s
            """, (manutencao_id,))
            manutencao_existente = cur.fetchone()
            
            if not manutencao_existente:
                raise HTTPException(status_code=404, detail="Manutenção não encontrada")

            # 2. Verifica se já está concluída
            if manutencao_existente['status'] == 'CONCLUIDO':
                raise HTTPException(status_code=400, detail="Manutenção já está concluída")

            # 3. Constrói query dinâmica (apenas campos enviados)
            updates = []
            valores = []
            
            if manutencao.descricao_defeito is not None:
                updates.append("descricao_defeito = %s")
                valores.append(manutencao.descricao_defeito)
            
            if manutencao.status is not None:
                updates.append("status = %s")
                valores.append(manutencao.status.value)
                
                # Se status for CONCLUIDO, define data_conclusao
                if manutencao.status == StatusManutencao.CONCLUIDO:
                    updates.append("data_conclusao = %s")
                    valores.append(datetime.now())
            else:
                # Se status não foi enviado, mantém o atual
                pass
            
            if manutencao.data_conclusao is not None:
                updates.append("data_conclusao = %s")
                valores.append(manutencao.data_conclusao)
            
            if not updates:
                raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
            
            # 4. Executa a atualização
            valores.append(manutencao_id)
            sql = f"UPDATE manutencao SET {', '.join(updates)} WHERE id = %s"
            cur.execute(sql, valores)

            # 5. Se o status for CONCLUIDO, atualiza o equipamento
            if manutencao.status == StatusManutencao.CONCLUIDO:
                # Verifica se o equipamento está em manutenção
                cur.execute("SELECT status FROM equipamento WHERE id = %s", (manutencao_existente['id_equipamento'],))
                equipamento = cur.fetchone()
                
                if equipamento and equipamento['status'] == 'EM_MANUTENCAO':
                    cur.execute("""
                        UPDATE equipamento SET status = 'DISPONIVEL' 
                        WHERE id = %s
                    """, (manutencao_existente['id_equipamento'],))
            
            # 6. COMMIT - Libera os locks
            con.commit()

            # 7. Registra histórico (DEPOIS do commit, em conexão separada)
            if manutencao.status == StatusManutencao.CONCLUIDO:
                await self._registrar_historico(
                    id_equipamento=manutencao_existente['id_equipamento'],
                    id_usuario_acao=1,  # TODO: pegar do usuário logado
                    status_anterior=StatusEquipamento.EM_MANUTENCAO.value,
                    status_novo=StatusEquipamento.DISPONIVEL.value,
                    descricao=f"Manutenção concluída - ID: {manutencao_id}"
                )

            return {
                "sucesso": True,
                "mensagem": "Manutenção atualizada com sucesso"
            }

        except pymysql.err.OperationalError as e:
            if con:
                con.rollback()
            traceback.print_exc()
            
            if "Lock wait timeout" in str(e) or "1205" in str(e):
                try:
                    kill_con = pymysql.connect(**self.config_db)
                    kill_cur = kill_con.cursor()
                    kill_cur.execute("""
                        SELECT trx_mysql_thread_id 
                        FROM information_schema.INNODB_TRX 
                        WHERE trx_state = 'LOCK WAIT'
                        LIMIT 1
                    """)
                    trx = kill_cur.fetchone()
                    if trx:
                        kill_cur.execute(f"KILL {trx['trx_mysql_thread_id']}")
                        kill_con.commit()
                    kill_cur.close()
                    kill_con.close()
                except:
                    pass
                
                raise HTTPException(
                    status_code=409, 
                    detail="O recurso está bloqueado. Tente novamente em alguns segundos."
                )
            else:
                raise HTTPException(status_code=500, detail=str(e))
                
        except HTTPException:
            raise
        except Exception as e:
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    async def excluir_manutencao(self, manutencao_id: int):
        """Exclui uma manutenção existente"""
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 1. Verifica se a manutenção existe
            cur.execute("SELECT id, id_equipamento, status FROM manutencao WHERE id = %s", (manutencao_id,))
            manutencao = cur.fetchone()
            if not manutencao:
                raise HTTPException(status_code=404, detail="Manutenção não encontrada")
            
            # 2. Verifica se já está concluída (não pode excluir se já concluída)
            if manutencao['status'] == 'CONCLUIDO':
                raise HTTPException(status_code=400, detail="Não é possível excluir uma manutenção já concluída")
            
            # 3. Atualiza o status do equipamento para DISPONIVEL
            cur.execute("""
                UPDATE equipamento SET status = 'DISPONIVEL' 
                WHERE id = %s
            """, (manutencao['id_equipamento'],))
            
            # 4. Exclui a manutenção
            sql = "DELETE FROM manutencao WHERE id = %s"
            cur.execute(sql, (manutencao_id,))
            con.commit()
            
            # 5. Registra histórico
            await self._registrar_historico(
                id_equipamento=manutencao['id_equipamento'],
                id_usuario_acao=1,  # TODO: pegar do usuário logado
                status_anterior=StatusEquipamento.EM_MANUTENCAO.value,
                status_novo=StatusEquipamento.DISPONIVEL.value,
                descricao=f"Manutenção excluída - ID: {manutencao_id}"
            )

            return {
                "sucesso": True,
                "mensagem": "Manutenção excluída com sucesso"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()