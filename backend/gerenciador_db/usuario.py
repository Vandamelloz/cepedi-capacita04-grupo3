from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from seguranca import obter_hash_senha

# gerenciador_db/usuario.py
from models.models import Usuario

class UsuarioRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
    
    # Método assíncrono para criar um novo usuário
    async def criar_usuario(self, usuario: Usuario):
        con = None
        cur = None

        try:
            # 1. Hasheia a senha recebida da API
            senha_hasheada = obter_hash_senha(usuario.senha)

            # 2. Abre a conexão com o banco de dados
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 3. Executa a query com a senha criptografada
            sql = "INSERT INTO usuario (nome, email, senha) VALUES (%s, %s, %s)"
            cur.execute(sql, (usuario.nome, usuario.email, senha_hasheada))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário criado com sucesso"
            }
        except Exception as e:
            if con:
                con.rollback()
            import traceback
            traceback.print_exc()
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()
    
    # Método assíncrono para listar usuários ativos
    async def listar_usuarios(self,):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()
        
            # Filtro de ativos e remoção do SELECT *
            sql = "SELECT id, nome, email, ativo, data_cadastro FROM usuario WHERE ativo = True"
            cur.execute(sql)
            usuarios = cur.fetchall()

            return {
                "sucesso": True,
                "usuarios": usuarios
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # Método assíncrono para atualizar usuário ativo
    async def atualizar_usuario(self, usuario_id: int, usuario: Usuario):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE usuario SET nome = %s, email = %s, senha = %s WHERE id = %s"
            cur.execute(sql, (usuario.nome, usuario.email, usuario.senha, usuario_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário atualizado com sucesso"
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
    
    # Método assíncrono para inativar usuário
    async def inativar_usuario(self, usuario_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Comando de UPDATE no lugar do DELETE FROM
            sql = "UPDATE usuario SET ativo = False WHERE id = %s"
            cur.execute(sql, (usuario_id,))
            
            # Validação: verifica se o banco de dados realmente encontrou e alterou a linha
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
                
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário inativado com sucesso"
            }
            
        except HTTPException:
            # Permite que o erro 404 (Não encontrado) passe direto para o cliente
            raise
        except Exception as e:
            # Captura erros graves de banco de dados ou sintaxe
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()
    
    # Método assíncrono para reativar usuário
    async def reativar_usuario(self, usuario_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Comando de UPDATE no lugar do DELETE FROM
            sql = "UPDATE usuario SET ativo = True WHERE id = %s"
            cur.execute(sql, (usuario_id,))
            
            # Validação: verifica se o banco de dados realmente encontrou e alterou a linha
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
                
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário reativado com sucesso"
            }
            
        except HTTPException:
            # Permite que o erro 404 (Não encontrado) passe direto para o cliente
            raise
        except Exception as e:
            # Captura erros graves de banco de dados ou sintaxe
            con.rollback()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()