from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from datetime import datetime

# gerenciador_db/emprestimo.py
from models.models import Emprestimo, StatusEmprestimo, StatusEquipamento, StatusReserva

class EmprestimoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
        self.historico_repositorio = None
        self.reserva_repositorio = None  # ← Adiciona referência ao repositório de reservas

    def set_historico_repositorio(self, historico_repositorio):
        self.historico_repositorio = historico_repositorio

    def set_reserva_repositorio(self, reserva_repositorio):
        """Injeta o repositório de reservas para integração"""
        self.reserva_repositorio = reserva_repositorio

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

    async def _verificar_reserva(self, cur, id_equipamento: int, id_usuario: int):
        """
        Verifica se o equipamento tem reserva ativa.
        Retorna:
        - (True, reserva_id) se a reserva é do mesmo usuário (pode prosseguir)
        - (False, None) se não tem reserva ou reserva cancelada
        - Levanta exceção se reserva for de outro usuário
        """
        # Busca reserva ativa para este equipamento (status PENDENTE ou EFETIVADA)
        cur.execute("""
            SELECT id, id_usuario, status 
            FROM reserva 
            WHERE id_equipamento = %s 
            AND status IN ('PENDENTE', 'EFETIVADA')
            ORDER BY data_reserva ASC
            LIMIT 1
        """, (id_equipamento,))
        
        reserva = cur.fetchone()
        
        if not reserva:
            return False, None  # Não tem reserva
        
        if reserva['id_usuario'] == id_usuario:
            # É a mesma pessoa que fez a reserva → pode emprestar!
            return True, reserva['id']
        else:
            # Outra pessoa fez a reserva → não pode emprestar
            raise HTTPException(
                status_code=400, 
                detail=f"Equipamento está reservado por outro usuário. Aguarde a reserva expirar."
            )

    async def criar_emprestimo(self, emprestimo: Emprestimo):
        con = None
        cur = None
        reserva_id = None
        reserva_do_mesmo_usuario = False

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # ============================================================
            # 1. VERIFICAÇÕES INICIAIS
            # ============================================================

            # Verifica equipamento
            cur.execute("SELECT status FROM equipamento WHERE id = %s", (emprestimo.id_equipamento,))
            equipamento = cur.fetchone()
            if not equipamento:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            status_atual = equipamento['status']

            # ============================================================
            # 2. LÓGICA DE RESERVA
            # ============================================================

            # Se o equipamento está RESERVADO, verifica se é do mesmo usuário
            if status_atual == 'RESERVADO':
                reserva_do_mesmo_usuario, reserva_id = await self._verificar_reserva(
                    cur, emprestimo.id_equipamento, emprestimo.id_usuario
                )
                # Se chegou aqui, é o mesmo usuário → pode continuar

            # Se o equipamento está DISPONIVEL, verifica se tem reserva ativa
            elif status_atual == 'DISPONIVEL':
                tem_reserva, reserva_id = await self._verificar_reserva(
                    cur, emprestimo.id_equipamento, emprestimo.id_usuario
                )
                if tem_reserva:
                    reserva_do_mesmo_usuario = True

            # Se o equipamento está em outro status que não DISPONIVEL ou RESERVADO
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Equipamento não está disponível para empréstimo. Status atual: {status_atual}"
                )

            # ============================================================
            # 3. VERIFICAÇÕES DO USUÁRIO
            # ============================================================

            # Verifica usuário ativo
            cur.execute("SELECT id FROM usuario WHERE id = %s AND ativo = True", (emprestimo.id_usuario,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Usuário não encontrado ou inativo")

            # Verifica técnico de saída
            cur.execute("SELECT id FROM usuario WHERE id = %s AND ativo = True", (emprestimo.id_tecnico_saida,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Técnico de saída não encontrado ou inativo")

            # ============================================================
            # 4. LIMITE DE EMPRÉSTIMOS (máximo 3)
            # ============================================================

            cur.execute("""
                SELECT COUNT(*) as total 
                FROM emprestimo 
                WHERE id_usuario = %s AND status IN ('ATIVO', 'ATRASADO')
            """, (emprestimo.id_usuario,))
            total_ativos = cur.fetchone()['total']
            if total_ativos >= 3:
                raise HTTPException(status_code=400, detail="Usuário já possui 3 equipamentos emprestados")

            # ============================================================
            # 5. CRIA O EMPRÉSTIMO
            # ============================================================

            sql = """
                INSERT INTO emprestimo 
                (id_usuario, id_equipamento, id_tecnico_saida, id_tecnico_retorno,
                 data_retirada, data_previsao_devolucao, observacoes, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                emprestimo.id_usuario,
                emprestimo.id_equipamento,
                emprestimo.id_tecnico_saida,
                emprestimo.id_tecnico_retorno,
                datetime.now(),
                emprestimo.data_previsao_devolucao,
                emprestimo.observacoes,
                StatusEmprestimo.ATIVO.value
            ))
            con.commit()

            id_gerado = cur.lastrowid

            # ============================================================
            # 6. ATUALIZA STATUS DO EQUIPAMENTO
            # ============================================================

            cur.execute("UPDATE equipamento SET status = 'EM_USO' WHERE id = %s", (emprestimo.id_equipamento,))

            # ============================================================
            # 7. SE TINHA RESERVA DO MESMO USUÁRIO, ATUALIZA A RESERVA
            # ============================================================

            if reserva_do_mesmo_usuario and reserva_id:
                cur.execute("""
                    UPDATE reserva 
                    SET status = 'EFETIVADA' 
                    WHERE id = %s
                """, (reserva_id,))
                
                # Mensagem adicional para o retorno
                mensagem_reserva = " Reserva do mesmo usuário foi efetivada automaticamente."

            else:
                mensagem_reserva = ""

            con.commit()

            # ============================================================
            # 8. REGISTRA HISTÓRICO
            # ============================================================

            await self._registrar_historico(
                id_equipamento=emprestimo.id_equipamento,
                id_usuario_acao=emprestimo.id_tecnico_saida,
                status_anterior=status_atual,
                status_novo=StatusEquipamento.EM_USO.value,
                descricao=f"Empréstimo criado - ID: {id_gerado} - Usuário: {emprestimo.id_usuario}"
            )

            return {
                "sucesso": True,
                "mensagem": f"Empréstimo criado com sucesso.{mensagem_reserva}",
                "id": id_gerado,
                "reserva_efetivada": bool(reserva_do_mesmo_usuario and reserva_id)
            }

        except HTTPException:
            raise
        except Exception as e:
            if con: con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()
    

    async def registrar_devolucao(self, emprestimo_id: int, id_tecnico_retorno: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica empréstimo ativo
            cur.execute("""
                SELECT id, id_equipamento, id_usuario, status, data_devolucao_real 
                FROM emprestimo 
                WHERE id = %s
            """, (emprestimo_id,))
            emprestimo = cur.fetchone()

            if not emprestimo:
                raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

            if emprestimo['data_devolucao_real'] is not None:
                raise HTTPException(status_code=400, detail="Este empréstimo já foi devolvido")

            # Verifica técnico de retorno
            cur.execute("SELECT id FROM usuario WHERE id = %s AND ativo = True", (id_tecnico_retorno,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Técnico de retorno não encontrado ou inativo")

            # Registra devolução
            sql = """
                UPDATE emprestimo 
                SET data_devolucao_real = NOW(), id_tecnico_retorno = %s, status = 'DEVOLVIDO'
                WHERE id = %s
            """
            cur.execute(sql, (id_tecnico_retorno, emprestimo_id))
            con.commit()

            # Atualiza status do equipamento
            cur.execute("UPDATE equipamento SET status = 'DISPONIVEL' WHERE id = %s", (emprestimo['id_equipamento'],))
            con.commit()

            # Registra histórico
            await self._registrar_historico(
                id_equipamento=emprestimo['id_equipamento'],
                id_usuario_acao=id_tecnico_retorno,
                status_anterior=StatusEquipamento.EM_USO.value,
                status_novo=StatusEquipamento.DISPONIVEL.value,
                descricao=f"Devolução registrada - Empréstimo ID: {emprestimo_id}"
            )

            return {
                "sucesso": True,
                "mensagem": "Devolução registrada com sucesso",
                "data_devolucao": datetime.now().isoformat()
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

    async def listar_emprestimos(self, apenas_ativos: bool = False):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                SELECT 
                    e.id AS emprestimo_id,
                    e.id_equipamento,
                    eq.nome AS nome_equipamento,
                    eq.codigo_patrimonio,
                    e.id_usuario,
                    u.nome AS nome_usuario,
                    e.id_tecnico_saida,
                    ts.nome AS nome_tecnico_saida,
                    e.id_tecnico_retorno,
                    tr.nome AS nome_tecnico_retorno,
                    e.data_retirada,
                    e.data_previsao_devolucao,
                    e.data_devolucao_real,
                    e.observacoes,
                    e.status
                FROM emprestimo e
                INNER JOIN usuario u ON e.id_usuario = u.id
                INNER JOIN equipamento eq ON e.id_equipamento = eq.id
                LEFT JOIN usuario ts ON e.id_tecnico_saida = ts.id
                LEFT JOIN usuario tr ON e.id_tecnico_retorno = tr.id
            """

            if apenas_ativos:
                sql += " WHERE e.status IN ('ATIVO', 'ATRASADO')"

            sql += " ORDER BY e.data_retirada DESC"

            cur.execute(sql)
            emprestimos = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(emprestimos),
                "emprestimos": emprestimos
            }

        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # Método para corrigir dados de um empréstimo que ainda está em andamento
    async def atualizar_emprestimo(self, emprestimo_id: int, emprestimo: Emprestimo):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 🔴 APENAS VERIFICA SE EXISTE (sem verificar status)
            cur.execute("SELECT id FROM emprestimo WHERE id = %s", (emprestimo_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Empréstimo não encontrado")
            
            # Constrói query dinâmica
            updates = []
            valores = []
            
            if emprestimo.data_previsao_devolucao is not None:
                updates.append("data_previsao_devolucao = %s")
                valores.append(emprestimo.data_previsao_devolucao)
            
            if emprestimo.observacoes is not None:
                updates.append("observacoes = %s")
                valores.append(emprestimo.observacoes)
            
            if emprestimo.status is not None:
                updates.append("status = %s")
                valores.append(emprestimo.status.value)
            
            if not updates:
                raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
            
            valores.append(emprestimo_id)
            sql = f"UPDATE emprestimo SET {', '.join(updates)} WHERE id = %s"
            cur.execute(sql, valores)
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Empréstimo atualizado com sucesso"
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

