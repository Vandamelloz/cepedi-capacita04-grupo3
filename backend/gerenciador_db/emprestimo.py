from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/emprestimo.py
from models.models import Emprestimo
from models.models import Usuario, Equipamento

class EmprestimoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    # Método assíncrono para criar um novo empréstimo
    async def criar_emprestimo(self, emprestimo: Emprestimo):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "INSERT INTO emprestimo (id_usuario, id_equipamento, id_tecnico_saida, id_tecnico_retorno, data_retirada, data_previsao_devolucao, data_devolucao_real, observacoes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            cur.execute(sql, (emprestimo.id_usuario, emprestimo.id_equipamento, emprestimo.id_tecnico_saida, emprestimo.id_tecnico_retorno, emprestimo.data_retirada, emprestimo.data_previsao_devolucao, emprestimo.data_devolucao_real, emprestimo.observacoes))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Empréstimo criado com sucesso"
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
    
    # Método assíncrono para listar todos os empréstimos
    async def listar_emprestimos(self,):

        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Modificar para fazer o join com a tabela de usuários e equipamentos para retornar os nomes ao invés dos IDs
            """sql = "SELECT e.id_equipamento, u.id_usuario, e.data_retirada, e.data_previsao_devolucao FROM emprestimo e JOIN usuario u ON e.id_usuario = u.id WHERE e.data_devolucao_real IS NULL""""
            sql = "SELECT * FROM emprestimo"
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

    # Método assíncrono para atualizar um empréstimo existente
    async def atualizar_emprestimo(self, emprestimo_id: int, emprestimo: Emprestimo):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            sql = "UPDATE emprestimo SET data_devolucao_real = %s WHERE id  = %s"
            cur.execute(sql, (emprestimo.data_devolucao_real, emprestimo_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Empréstimo atualizado com sucesso"
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
