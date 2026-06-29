from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/reserva.py
from models.models import Reserva

class ReservaRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    # Método assíncrono para criar um novo reserva
    async def criar_reserva(self, reserva: Reserva):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "INSERT INTO reserva (id_usuario, id_equipamento, data_reserva, data_solicitacao) VALUES (%s, %s, %s, %s)"
            cur.execute(sql, (reserva.id_usuario, reserva.id_equipamento, reserva.data_reserva, reserva.data_solicitacao))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Reserva criada com sucesso"
            }
        except Exception as e:
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # Método assícrono para listar reservas ativas
    async def listar_reservas(self,):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "SELECT id, id_usuario, id_equipamento, data_reserva, data_solicitacao FROM reserva"
            cur.execute(sql)
            reservas = cur.fetchall()

            return {
                "sucesso":True,
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

    # Método assíncrono para atualizar uma reserva
    async def atualizar_reserva(self, reserva_id: int, reserva: Reserva):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE reserva SET data_reserva = %s WHERE id = %s"
            cur.execute(sql, (reserva.data_reserva, reserva_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Reserva atualizada com sucesso"
            }
        except Exception as e:
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()
    
    # Método assíncrono para excluir uma reserva
    async def excluir_reserva(self, reserva_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "DELETE FROM reserva WHERE id = %s"
            cur.execute(sql, (reserva_id,))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Reserva excluída com sucesso"
            }
        except Exception as e:
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()