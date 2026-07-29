from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback

# gerenciador_db/equipamento.py
from models.models import Equipamento, StatusEquipamento

class EquipamentoRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    async def criar_equipamento(self, equipamento: Equipamento):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se a categoria existe
            cur.execute("SELECT id FROM categoria WHERE id = %s", (equipamento.id_categoria,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Categoria não encontrada")
            
            qtd = equipamento.quantidade if hasattr(equipamento, 'quantidade') else 1
            
            # 🔴 CORREÇÃO: Garante que o status sempre tenha um valor
            if equipamento.status and hasattr(equipamento.status, 'value'):
                status_seguro = equipamento.status.value
            else:
                status_seguro = 'DISPONIVEL'
            
            sql = """
                INSERT INTO equipamento 
                (codigo_patrimonio, nome, modelo, id_categoria, quantidade, status, ativo) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(sql, (
                equipamento.codigo_patrimonio,
                equipamento.nome,
                equipamento.modelo,
                equipamento.id_categoria,
                qtd,
                status_seguro,
                equipamento.ativo if equipamento.ativo is not None else True
            ))
            con.commit()

            id_gerado = cur.lastrowid

            # 🔴 CORREÇÃO: Busca o equipamento criado para retornar todos os dados
            cur.execute("""
                SELECT id, codigo_patrimonio, nome, modelo, id_categoria, quantidade, status, ativo 
                FROM equipamento 
                WHERE id = %s
            """, (id_gerado,))
            equipamento_criado = cur.fetchone()

            return {
                "sucesso": True,
                "mensagem": "Equipamento criado com sucesso",
                "id": id_gerado,
                "equipamento": equipamento_criado  # ← Retorna o equipamento completo
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

    async def listar_equipamentos(self):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                SELECT e.*, c.nome as nome_categoria 
                FROM equipamento e
                INNER JOIN categoria c ON e.id_categoria = c.id
                WHERE e.ativo = True
                ORDER BY e.id
            """
            cur.execute(sql)
            equipamentos = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(equipamentos),
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

    async def atualizar_equipamento(self, equipamento_id: int, equipamento: Equipamento):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se o equipamento existe
            cur.execute("SELECT id FROM equipamento WHERE id = %s", (equipamento_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            # 🔴 CORREÇÃO: Garante que o status sempre tenha um valor para UPDATE também
            if equipamento.status and hasattr(equipamento.status, 'value'):
                status_seguro = equipamento.status.value
            else:
                status_seguro = 'DISPONIVEL'

            sql = """
                UPDATE equipamento 
                SET codigo_patrimonio = %s, nome = %s, modelo = %s, 
                    id_categoria = %s, status = %s 
                WHERE id = %s
            """
            cur.execute(sql, (
                equipamento.codigo_patrimonio,
                equipamento.nome,
                equipamento.modelo,
                equipamento.id_categoria,
                status_seguro,  # ← CORRIGIDO
                equipamento_id
            ))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Equipamento atualizado com sucesso"
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

    async def inativar_equipamento(self, equipamento_id: int):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se o equipamento está em uso
            cur.execute("""
                SELECT id FROM emprestimo 
                WHERE id_equipamento = %s AND data_devolucao_real IS NULL
            """, (equipamento_id,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail="Não é possível inativar equipamento emprestado"
                )

            sql = "UPDATE equipamento SET ativo = False, status = 'INATIVO' WHERE id = %s"
            cur.execute(sql, (equipamento_id,))
            con.commit()

            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            return {
                "sucesso": True,
                "mensagem": "Equipamento inativado com sucesso"
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

    async def reativar_equipamento(self, equipamento_id: int):
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE equipamento SET ativo = True, status = 'DISPONIVEL' WHERE id = %s"
            cur.execute(sql, (equipamento_id,))
            con.commit()

            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            return {
                "sucesso": True,
                "mensagem": "Equipamento reativado com sucesso"
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

    async def excluir_equipamento(self, equipamento_id: int):
        """
        Exclui um equipamento permanentemente do banco.
        ⚠️ Verifica se o equipamento está emprestado antes de excluir.
        """
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 1. Verifica se o equipamento existe
            cur.execute("SELECT id, status FROM equipamento WHERE id = %s", (equipamento_id,))
            equipamento = cur.fetchone()
            if not equipamento:
                raise HTTPException(status_code=404, detail="Equipamento não encontrado")

            # 2. Verifica se o equipamento está emprestado (não pode excluir)
            cur.execute("""
                SELECT id FROM emprestimo 
                WHERE id_equipamento = %s AND data_devolucao_real IS NULL
            """, (equipamento_id,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail="Não é possível excluir equipamento emprestado. Registre a devolução primeiro."
                )

            # 3. Verifica se o equipamento está em manutenção (não pode excluir)
            cur.execute("""
                SELECT id FROM manutencao 
                WHERE id_equipamento = %s AND status != 'CONCLUIDO'
            """, (equipamento_id,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail="Não é possível excluir equipamento em manutenção. Conclua a manutenção primeiro."
                )

            # 4. Exclui o equipamento
            sql = "DELETE FROM equipamento WHERE id = %s"
            cur.execute(sql, (equipamento_id,))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": f"Equipamento ID {equipamento_id} excluído permanentemente com sucesso"
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