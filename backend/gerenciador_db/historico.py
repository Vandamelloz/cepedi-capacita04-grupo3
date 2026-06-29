from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from models.models import HistoricoMovimentacao

class HistoricoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    # Método para registar uma nova ação no histórico
    async def registrar_movimentacao(self, historico: HistoricoMovimentacao):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            sql = "INSERT INTO historico_movimentacao (id_equipamento, id_usuario_acao, descricao_motivo) VALUES (%s, %s, %s)"
            cur.execute(sql, (historico.id_equipamento, historico.id_usuario_acao, historico.descricao_motivo))
            con.commit()
            
            return {
                "sucesso": True,
                "mensagem": "Movimentação registada com sucesso no histórico"
            }
        except Exception as e:
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()

    # Método para listar todo o histórico (com filtro opcional por equipamento)
    async def listar_historico(self, id_equipamento: int = None):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            if id_equipamento:
                sql = "SELECT * FROM historico_movimentacao WHERE id_equipamento = %s ORDER BY data_movimentacao DESC"
                cur.execute(sql, (id_equipamento,))
            else:
                sql = "SELECT * FROM historico_movimentacao ORDER BY data_movimentacao DESC"
                cur.execute(sql)
                
            historico = cur.fetchall()
            return {
                "sucesso": True,
                "quantidade": len(historico),
                "historico": historico
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()