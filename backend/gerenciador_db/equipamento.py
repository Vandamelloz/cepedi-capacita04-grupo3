from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/equipamento.py
from models.models import Equipamento

class EquipamentoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
    
    # Método assíncrono para criar um novo equipamento
    async def criar_equipamento(self, equipamento: Equipamento):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "INSERT INTO equipamento (codigo_patrimonio, nome, modelo, id_categoria) VALUES (%s, %s, %s, %s)"
            cur.execute(sql, (equipamento.codigo_patrimonio, equipamento.nome, equipamento.modelo, equipamento.id_categoria))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Equipamento criado com sucesso"
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

    # Método assíncrono para listar equipamentos ativos
    async def listar_equipamentos(self,):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # SELECT com o filtro de Soft Delete
            sql = "SELECT id, codigo_patrimonio, nome, modelo, id_categoria, ativo FROM equipamento WHERE ativo = True"
            cur.execute(sql)
            equipamentos = cur.fetchall()

            return {
                "sucesso": True,
                "equipamentos": equipamentos
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()
    
    # Método assíncrono para listar equipamentos ativos
    async def atualizar_equipamento(self, equipamento_id: int, equipamento: Equipamento):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE equipamento SET codigo_patrimonio = %s, nome = %s, modelo = %s, id_categoria = %s WHERE id = %s"
            cur.execute(sql, (equipamento.codigo_patrimonio, equipamento.nome, equipamento.modelo, equipamento.id_categoria, equipamento_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Equipamento atualizado com sucesso"
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

    # Método assíncrono para inativar equipamento
    async def inativar_equipamento(self, equipamento_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # O UPDATE substitui o DELETE FROM
            sql = "UPDATE equipamento SET ativo = False WHERE id = %s"
            cur.execute(sql, (equipamento_id,))
            
            # Trava de segurança para ver se o equipamento realmente existia
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado.")
                
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Equipamento inativado com sucesso"
            }
        except HTTPException:
            raise
        except Exception as e:
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()
    
    # Método assíncrono para reativar equipamento
    async def reativar_equipamento(self, equipamento_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # O UPDATE substitui o DELETE FROM
            sql = "UPDATE equipamento SET ativo = True WHERE id = %s"
            cur.execute(sql, (equipamento_id,))
            
            # Trava de segurança para ver se o equipamento realmente existia
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado.")
                
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Equipamento inativado com sucesso"
            }
        except HTTPException:
            raise
        except Exception as e:
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()