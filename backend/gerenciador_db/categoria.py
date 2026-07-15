from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/categoria.py
from models.models import Categoria

class CategoriaRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    # Método assíncrono para criar uma nova categoria
    async def criar_categoria(self, categoria: Categoria):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "INSERT INTO categoria (nome, descricao) VALUES (%s, %s)"
            cur.execute(sql, (categoria.nome, categoria.descricao))
            con.commit()

            id_gerado = cur.lastrowid

            return {
                "sucesso": True,
                "mensagem": "Categoria criada com sucesso",
                "id": id_gerado,
                "categoria": {
                    "nome": categoria.nome,
                    "descricao": categoria.descricao
                }
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

    # Método assíncrono para listar todas as categorias
    async def listar_categorias(self):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "SELECT id, nome, descricao, data_criacao FROM categoria ORDER BY id"
            cur.execute(sql)
            categorias = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(categorias),
                "categorias": categorias
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # Método assíncrono para atualizar uma categoria existente
    async def atualizar_categoria(self, categoria_id: int, categoria: Categoria):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE categoria SET nome = %s, descricao = %s WHERE id = %s"
            cur.execute(sql, (categoria.nome, categoria.descricao, categoria_id))
            con.commit()

            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Categoria não encontrada")

            return {
                "sucesso": True,
                "mensagem": "Categoria atualizada com sucesso"
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

    # Método assíncrono para excluir uma categoria existente
    async def excluir_categoria(self, categoria_id: int):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se tem equipamentos vinculados
            cur.execute("SELECT id FROM equipamento WHERE id_categoria = %s", (categoria_id,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail="Não é possível excluir categoria com equipamentos vinculados"
                )

            sql = "DELETE FROM categoria WHERE id = %s"
            cur.execute(sql, (categoria_id,))
            con.commit()

            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Categoria não encontrada")

            return {
                "sucesso": True,
                "mensagem": "Categoria excluída com sucesso"
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