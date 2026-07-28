from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from models.models import Reserva, StatusReserva, StatusEquipamento

class ReservaRepositorio:
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

    async def criar_reserva(self, reserva: Reserva):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica equipamento disponível
            cur.execute("SELECT status FROM equipamento WHERE id = %s", (reserva.id_equipamento,))
            equipamento = cur.fetchone()
            if not equipamento:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")
            if equipamento['status'] not in ['DISPONIVEL', 'RESERVADO']:
                raise HTTPException(status_code=400, detail="Equipamento não está disponível para reserva")

            # Verifica se já existe reserva para mesma data
            cur.execute("""
                SELECT id FROM reserva 
                WHERE id_equipamento = %s 
                AND data_reserva = %s 
                AND status != 'CANCELADA'
            """, (reserva.id_equipamento, reserva.data_reserva))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Equipamento já reservado para esta data")

            # Atualiza status do equipamento
            cur.execute("UPDATE equipamento SET status = 'RESERVADO' WHERE id = %s", (reserva.id_equipamento,))

            sql = """
                INSERT INTO reserva (id_equipamento, id_usuario, data_reserva, status) 
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(sql, (
                reserva.id_equipamento,
                reserva.id_usuario,
                reserva.data_reserva,
                reserva.status.value
            ))
            con.commit()

            id_gerado = cur.lastrowid

            # Registra histórico
            await self._registrar_historico(
                id_equipamento=reserva.id_equipamento,
                id_usuario_acao=reserva.id_usuario,
                status_anterior=equipamento['status'],
                status_novo=StatusEquipamento.RESERVADO.value,
                descricao=f"Reserva criada - ID: {id_gerado}"
            )

            return {
                "sucesso": True,
                "mensagem": "Reserva criada com sucesso",
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

    async def listar_reservas(self, usuario_logado: dict = None):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                SELECT r.*, eq.nome as nome_equipamento, u.nome as nome_usuario
                FROM reserva r
                INNER JOIN equipamento eq ON r.id_equipamento = eq.id
                INNER JOIN usuario u ON r.id_usuario = u.id
                WHERE r.status != 'CANCELADA'
            """
            params = []

            if usuario_logado and usuario_logado.get("perfil") == "COMUM":
                sql += " AND r.id_usuario = %s"
                params.append(usuario_logado["id"])

            sql += " ORDER BY r.data_reserva ASC"

            cur.execute(sql, params)
            reservas = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(reservas),
                "reservas": reservas
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    async def atualizar_reserva(self, reserva_id: int, reserva: Reserva):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                UPDATE reserva 
                SET data_reserva = %s, status = %s 
                WHERE id = %s
            """
            cur.execute(sql, (reserva.data_reserva, reserva.status.value, reserva_id))
            con.commit()

            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Reserva não encontrada")

            return {
                "sucesso": True,
                "mensagem": "Reserva atualizada com sucesso"
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

    async def excluir_reserva(self, reserva_id: int):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Busca equipamento para atualizar status
            cur.execute("SELECT id_equipamento FROM reserva WHERE id = %s", (reserva_id,))
            reserva = cur.fetchone()
            if not reserva:
                raise HTTPException(status_code=404, detail="Reserva não encontrada")

            # Atualiza status para CANCELADA
            sql = "UPDATE reserva SET status = 'CANCELADA' WHERE id = %s"
            cur.execute(sql, (reserva_id,))
            con.commit()

            # Verifica se há outras reservas ativas para o mesmo equipamento
            cur.execute("""
                SELECT id FROM reserva 
                WHERE id_equipamento = %s AND status != 'CANCELADA'
            """, (reserva['id_equipamento'],))
            if not cur.fetchone():
                cur.execute("UPDATE equipamento SET status = 'DISPONIVEL' WHERE id = %s", (reserva['id_equipamento'],))

            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Reserva cancelada com sucesso"
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