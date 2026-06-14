from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/equipamento.py
from models.models import Manutencao

class ManutencaoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
    
    # Método assíncrono para criar uma nova manutenção
    async def criar_manutencao(self, manutencao: Manutencao):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "INSERT INTO manutencao (id_equipamento, descricao_defeito, data_conclusao) VALUES (%s, %s, %s)"
            cur.execute(sql, (manutencao.id_equipamento, manutencao.descricao_defeito, manutencao.data_conclusao))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Manutenção criada com sucesso"
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

    """Ainda em desenvolvimento"""