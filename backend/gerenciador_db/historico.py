from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from models.models import HistoricoMovimentacao

class HistoricoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    async def registrar_movimentacao(self, historico: HistoricoMovimentacao):
        """Registra uma movimentação no histórico (com timeout reduzido)"""
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 🔴 Reduz o timeout da transação para evitar locks longos
            cur.execute("SET innodb_lock_wait_timeout = 5")
            
            sql = """
                INSERT INTO historico_movimentacao 
                (id_equipamento, id_usuario_acao, status_anterior, status_novo, descricao_motivo) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                historico.id_equipamento,
                historico.id_usuario_acao,
                historico.status_anterior,
                historico.status_novo.value,
                historico.descricao_motivo
            ))
            con.commit()
            
            return {
                "sucesso": True,
                "mensagem": "Movimentação registrada com sucesso"
            }
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

    async def listar_historico(self, id_equipamento: int = None):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            if id_equipamento:
                sql = """
                    SELECT 
                        h.*,
                        u.nome AS nome_usuario_acao,
                        eq.nome AS nome_equipamento
                    FROM historico_movimentacao h
                    LEFT JOIN usuario u ON h.id_usuario_acao = u.id
                    INNER JOIN equipamento eq ON h.id_equipamento = eq.id
                    WHERE h.id_equipamento = %s 
                    ORDER BY h.data_movimentacao DESC
                """
                cur.execute(sql, (id_equipamento,))
            else:
                sql = """
                    SELECT 
                        h.*,
                        u.nome AS nome_usuario_acao,
                        eq.nome AS nome_equipamento
                    FROM historico_movimentacao h
                    LEFT JOIN usuario u ON h.id_usuario_acao = u.id
                    INNER JOIN equipamento eq ON h.id_equipamento = eq.id
                    ORDER BY h.data_movimentacao DESC
                """
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
            if cur:
                cur.close()
            if con:
                con.close()