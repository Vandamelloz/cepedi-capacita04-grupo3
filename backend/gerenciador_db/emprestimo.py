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
            return False, None

        if reserva['id_usuario'] == id_usuario:
            return True, reserva['id']
        else:
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

            cur.execute("SELECT status FROM equipamento WHERE id = %s", (emprestimo.id_equipamento,))
            equipamento = cur.fetchone()
            if not equipamento:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            status_atual = equipamento['status']

            # ============================================================
            # 2. LÓGICA DE RESERVA
            # ============================================================

            if status_atual == 'RESERVADO':
                reserva_do_mesmo_usuario, reserva_id = await self._verificar_reserva(
                    cur, emprestimo.id_equipamento, emprestimo.id_usuario
                )

            elif status_atual == 'DISPONIVEL':
                tem_reserva, reserva_id = await self._verificar_reserva(
                    cur, emprestimo.id_equipamento, emprestimo.id_usuario
                )
                if tem_reserva:
                    reserva_do_mesmo_usuario = True

            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Equipamento não está disponível para empréstimo. Status atual: {status_atual}"
                )

            # ============================================================
            # 3. VERIFICAÇÕES DO USUÁRIO
            # ============================================================

            cur.execute("SELECT id FROM usuario WHERE id = %s AND ativo = True", (emprestimo.id_usuario,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Usuário não encontrado ou inativo")

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
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    async def atualizar_emprestimo(self, emprestimo_id: int, emprestimo: Emprestimo):
        """
        Atualiza dados de um empréstimo já existente: prazo de devolução,
        observações, e transição para ATRASADO. Não cobre cancelamento
        (o enum StatusEmprestimo ainda não tem esse valor) nem devolução
        (isso continua sendo feito por registrar_devolucao, que também
        libera o equipamento e trata reserva/histórico).
        """
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 1. Verifica se o empréstimo existe e ainda não foi devolvido
            cur.execute("""
                SELECT id, id_equipamento, status, data_devolucao_real 
                FROM emprestimo 
                WHERE id = %s
            """, (emprestimo_id,))
            emprestimo_existente = cur.fetchone()

            if not emprestimo_existente:
                raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

            if emprestimo_existente['data_devolucao_real'] is not None:
                raise HTTPException(status_code=400, detail="Este empréstimo já foi devolvido e não pode ser editado")

            # 2. Bloqueia tentativa de marcar como DEVOLVIDO por essa rota
            if emprestimo.status == StatusEmprestimo.DEVOLVIDO:
                raise HTTPException(
                    status_code=400, 
                    detail="Para registrar devolução, use o endpoint registrar_devolucao"
                )

            status_anterior = emprestimo_existente['status']

            # 3. Atualiza prazo, observações e status (ATIVO <-> ATRASADO)
            sql = """
                UPDATE emprestimo 
                SET data_previsao_devolucao = %s, 
                    observacoes = %s,
                    status = %s
                WHERE id = %s
            """
            cur.execute(sql, (
                emprestimo.data_previsao_devolucao,
                emprestimo.observacoes,
                emprestimo.status.value,
                emprestimo_id
            ))
            con.commit()

            # 4. Registra histórico apenas se o status mudou
            if status_anterior != emprestimo.status.value:
                await self._registrar_historico(
                    id_equipamento=emprestimo_existente['id_equipamento'],
                    id_usuario_acao=emprestimo.id_tecnico_saida,
                    status_anterior=status_anterior,
                    status_novo=emprestimo.status.value,
                    descricao=f"Empréstimo atualizado - ID: {emprestimo_id} ({status_anterior} → {emprestimo.status.value})"
                )

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

    async def registrar_devolucao(self, emprestimo_id: int, id_tecnico_retorno: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

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

            cur.execute("SELECT id FROM usuario WHERE id = %s AND ativo = True", (id_tecnico_retorno,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Técnico de retorno não encontrado ou inativo")

            sql = """
                UPDATE emprestimo 
                SET data_devolucao_real = NOW(), id_tecnico_retorno = %s, status = 'DEVOLVIDO'
                WHERE id = %s
            """
            cur.execute(sql, (id_tecnico_retorno, emprestimo_id))
            con.commit()

            cur.execute("UPDATE equipamento SET status = 'DISPONIVEL' WHERE id = %s", (emprestimo['id_equipamento'],))
            con.commit()

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