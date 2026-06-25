from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from models.models import LogAuditoria

class AuditoriaRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    # Método assíncrono para registar um novo evento de auditoria
    async def registrar_log(self, log: LogAuditoria):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                INSERT INTO logs_auditoria 
                (id_usuario, acao, tabela_afetada, id_registro_afetado, detalhes) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                log.id_usuario, 
                log.acao, 
                log.tabela_afetada, 
                log.id_registro_afetado, 
                log.detalhes
            ))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Log de auditoria registado com sucesso"
            }
        except Exception as e:
            if con:
                con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao registar log de auditoria: {str(e)}")
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # Método assíncrono para listar os logs (com filtros úteis para o painel do administrador)
    async def listar_logs(self, tabela: str = None, id_usuario: int = None):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Construção dinâmica da query com base nos filtros passados
            sql = """
                SELECT l.id, l.acao, l.tabela_afetada, l.id_registro_afetado, 
                       l.detalhes, l.data_acao, u.nome AS nome_usuario, u.email AS email_usuario
                FROM logs_auditoria l
                LEFT JOIN usuario u ON l.id_usuario = u.id
                WHERE 1=1
            """
            params = []

            if tabela:
                sql += " AND l.tabela_afetada = %s"
                params.append(tabela)
            if id_usuario:
                sql += " AND l.id_usuario = %s"
                params.append(id_usuario)

            sql += " ORDER BY l.data_acao DESC"
            
            cur.execute(sql, params)
            logs = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(logs),
                "logs": logs
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()