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

    # Método assíncrono para criar um novo empréstimo (SAÍDA)
    async def criar_emprestimo(self, emprestimo: Emprestimo):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 1. Verifica se tem no estoque
            cur.execute("SELECT quantidade FROM equipamento WHERE id = %s", (emprestimo.id_equipamento,))
            estoque = cur.fetchone()
            
            if not estoque or estoque['quantidade'] <= 0:
                raise HTTPException(status_code=400, detail="Equipamento indisponível ou sem saldo no estoque.")

            # 2. Registra a saída
            sql = """
                INSERT INTO emprestimo 
                (id_usuario, id_equipamento, id_tecnico_saida, data_retirada, data_previsao_devolucao, observacoes) 
                VALUES (%s, %s, %s, NOW(), %s, %s)
            """
            cur.execute(sql, (
                emprestimo.id_usuario, 
                emprestimo.id_equipamento, 
                emprestimo.id_tecnico_saida, 
                emprestimo.data_previsao_devolucao, 
                emprestimo.observacoes
            ))
            id_criado = cur.lastrowid
            
            # 3. Abate do estoque (-1)
            cur.execute("UPDATE equipamento SET quantidade = quantidade - 1 WHERE id = %s", (emprestimo.id_equipamento,))
            
            con.commit()

            return {
                "sucesso": True,
                "id": id_criado,
                "mensagem": "Empréstimo registrado e estoque atualizado com sucesso"
            }
        except Exception as e:
            if con: con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()
    
    # Método assíncrono para listar todos os empréstimos
    async def listar_emprestimos(self,):

        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Modificar para fazer o join com a tabela de usuários e equipamentos para retornar os nomes ao invés dos IDs
            # sql = "SELECT e.id_equipamento, u.id_usuario, e.data_retirada, e.data_previsao_devolucao FROM emprestimo e JOIN usuario u ON e.id_usuario = u.id WHERE e.data_devolucao_real IS NULL"
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

    # Método para corrigir dados de um empréstimo que ainda está em andamento
    async def atualizar_emprestimo(self, emprestimo_id: int, emprestimo: Emprestimo):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # Atualiza apenas os campos que fazem sentido ser corrigidos manualmente
            sql = "UPDATE emprestimo SET data_previsao_devolucao = %s, observacoes = %s WHERE id = %s"
            cur.execute(sql, (emprestimo.data_previsao_devolucao, emprestimo.observacoes, emprestimo_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Dados do empréstimo corrigidos com sucesso"
            }
        except Exception as e:
            if con: con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()

    # Método assíncrono para registrar a devolução (RETORNO)
    async def registrar_devolucao(self, emprestimo_id: int, id_tecnico_retorno: int):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
            
            # 1. Localiza o id do equipamento vinculado ao empréstimo
            cur.execute("SELECT id_equipamento FROM emprestimo WHERE id = %s", (emprestimo_id,))
            resultado = cur.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail="Empréstimo não encontrado.")
            
            id_equipamento = resultado['id_equipamento']

            # 2. Registra o retorno e o técnico responsável
            sql = "UPDATE emprestimo SET data_devolucao_real = NOW(), id_tecnico_retorno = %s WHERE id = %s"
            cur.execute(sql, (id_tecnico_retorno, emprestimo_id))
            
            # 3. Devolve para o estoque (+1)
            cur.execute("UPDATE equipamento SET quantidade = quantidade + 1 WHERE id = %s", (id_equipamento,))
            
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Devolução registrada e equipamento retornado ao estoque."
            }
        except Exception as e:
            if con: con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur: cur.close()
            if con: con.close()