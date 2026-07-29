from fastapi import HTTPException
import pymysql
from pymysql.cursors import DictCursor
import traceback
from seguranca import obter_hash_senha
from models.models import Usuario, TipoUsuario  # ← Importe o TipoUsuario

class UsuarioRepositorio:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor
    
    # ================================================================
    # MÉTODO PARA CRIAR USUÁRIO (COM TIPO_USUARIO)
    # ================================================================
    async def criar_usuario(self, usuario: Usuario):
        con = None
        cur = None

        try:
            # 1. Hasheia a senha recebida da API
            senha_hasheada = obter_hash_senha(usuario.senha)

            # 2. Abre a conexão com o banco de dados
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 3. Verifica se o email já existe
            cur.execute("SELECT id FROM usuario WHERE email = %s", (usuario.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email já cadastrado")

            # 4. Verifica se o tipo_usuario é válido
            tipos_validos = ['ADMINISTRADOR', 'TECNICO', 'COMUM']
            if usuario.tipo_usuario.value not in tipos_validos:
                raise HTTPException(status_code=400, detail="Tipo de usuário inválido")

            # 5. Executa a query com a senha criptografada e tipo_usuario
            sql = """
                INSERT INTO usuario (nome, email, senha, tipo_usuario) 
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(sql, (
                usuario.nome, 
                usuario.email, 
                senha_hasheada, 
                usuario.tipo_usuario.value  # ← Pega o valor do ENUM
            ))
            con.commit()

            id_gerado = cur.lastrowid

            return {
                "sucesso": True,
                "mensagem": "Usuário criado com sucesso",
                "id": id_gerado,
                "nome": usuario.nome,
                "email": usuario.email,
                "tipo_usuario": usuario.tipo_usuario.value
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

    # ================================================================
    # MÉTODO PARA LISTAR USUÁRIOS
    # ================================================================
    async def listar_usuarios(self):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 🔴 CORRIGIDO: Remove o filtro WHERE ativo = True
            sql = """
                SELECT id, nome, email, tipo_usuario, ativo, data_cadastro 
                FROM usuario 
                ORDER BY id
            """
            cur.execute(sql)
            usuarios = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(usuarios),
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

    # ================================================================
    # MÉTODO PARA LISTAR USUÁRIOS POR TIPO
    # ================================================================
    async def listar_usuarios_por_tipo(self, tipo: str):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Filtra por tipo_usuario
            sql = """
                SELECT id, nome, email, tipo_usuario, ativo, data_cadastro 
                FROM usuario 
                WHERE ativo = True AND tipo_usuario = %s
                ORDER BY id
            """
            cur.execute(sql, (tipo,))
            usuarios = cur.fetchall()

            return {
                "sucesso": True,
                "quantidade": len(usuarios),
                "tipo": tipo,
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

    # ================================================================
    # MÉTODO PARA BUSCAR UM USUÁRIO POR ID
    # ================================================================
    async def buscar_usuario(self, usuario_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = """
                SELECT id, nome, email, tipo_usuario, ativo, data_cadastro 
                FROM usuario 
                WHERE id = %s
            """
            cur.execute(sql, (usuario_id,))
            usuario = cur.fetchone()

            if not usuario:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")

            return {
                "sucesso": True,
                "usuario": usuario
            }

        except HTTPException:
            raise
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if cur:
                cur.close()
            if con:
                con.close()

    # ================================================================
    # MÉTODO PARA ATUALIZAR USUÁRIO (COM TIPO_USUARIO)
    # ================================================================
    async def atualizar_usuario(self, usuario_id: int, usuario: Usuario):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se o usuário existe
            cur.execute("SELECT id FROM usuario WHERE id = %s", (usuario_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Usuário não encontrado")

            # Verifica se o email já está sendo usado por outro usuário
            cur.execute("SELECT id FROM usuario WHERE email = %s AND id != %s", (usuario.email, usuario_id))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email já está em uso por outro usuário")

            # Hasheia a senha se foi fornecida
            senha_hasheada = obter_hash_senha(usuario.senha)

            # Atualiza incluindo tipo_usuario
            sql = """
                UPDATE usuario 
                SET nome = %s, email = %s, senha = %s, tipo_usuario = %s 
                WHERE id = %s
            """
            cur.execute(sql, (
                usuario.nome, 
                usuario.email, 
                senha_hasheada, 
                usuario.tipo_usuario.value,
                usuario_id
            ))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário atualizado com sucesso"
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

    # ================================================================
    # MÉTODO PARA INATIVAR USUÁRIO
    # ================================================================
    async def inativar_usuario(self, usuario_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Verifica se o usuário existe
            cur.execute("SELECT id FROM usuario WHERE id = %s", (usuario_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Usuário não encontrado")

            # Verifica se é o último administrador (não pode inativar)
            cur.execute("""
                SELECT COUNT(*) as total 
                FROM usuario 
                WHERE tipo_usuario = 'ADMINISTRADOR' AND ativo = True
            """)
            total_admins = cur.fetchone()['total']
            
            cur.execute("SELECT tipo_usuario FROM usuario WHERE id = %s", (usuario_id,))
            usuario_tipo = cur.fetchone()['tipo_usuario']
            
            if usuario_tipo == 'ADMINISTRADOR' and total_admins <= 1:
                raise HTTPException(status_code=400, detail="Não é possível inativar o último administrador do sistema")

            # Inativa o usuário
            sql = "UPDATE usuario SET ativo = False WHERE id = %s"
            cur.execute(sql, (usuario_id,))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário inativado com sucesso"
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

    # ================================================================
    # MÉTODO PARA REATIVAR USUÁRIO
    # ================================================================
    async def reativar_usuario(self, usuario_id: int):
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            sql = "UPDATE usuario SET ativo = True WHERE id = %s"
            cur.execute(sql, (usuario_id,))
            
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")
                
            con.commit()

            return {
                "sucesso": True,
                "mensagem": "Usuário reativado com sucesso"
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

    # ================================================================
    # MÉTODO PARA ALTERAR TIPO DE USUÁRIO (apenas ADMIN)
    # ================================================================
    async def alterar_tipo_usuario(self, usuario_id: int, novo_tipo: str, admin_id: int):
        """Altera o tipo de usuário. Apenas administradores podem fazer isso."""
        con = None
        cur = None

        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # 1. Verifica se o admin existe e é ADMINISTRADOR
            cur.execute("SELECT tipo_usuario FROM usuario WHERE id = %s AND ativo = True", (admin_id,))
            admin = cur.fetchone()
            if not admin or admin['tipo_usuario'] != 'ADMINISTRADOR':
                raise HTTPException(status_code=403, detail="Apenas administradores podem alterar tipos de usuário")

            # 2. Verifica se o usuário alvo existe
            cur.execute("SELECT id, tipo_usuario FROM usuario WHERE id = %s", (usuario_id,))
            usuario_alvo = cur.fetchone()
            if not usuario_alvo:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")

            # 3. Não permite alterar o próprio tipo (evita perder acesso)
            if usuario_id == admin_id:
                raise HTTPException(status_code=400, detail="Não é possível alterar seu próprio tipo de usuário")

            # 4. Verifica se o novo tipo é válido
            tipos_validos = ['ADMINISTRADOR', 'TECNICO', 'COMUM']
            if novo_tipo not in tipos_validos:
                raise HTTPException(status_code=400, detail="Tipo de usuário inválido")

            # 5. Verifica se o usuário alvo não é o último administrador
            if usuario_alvo['tipo_usuario'] == 'ADMINISTRADOR':
                cur.execute("""
                    SELECT COUNT(*) as total 
                    FROM usuario 
                    WHERE tipo_usuario = 'ADMINISTRADOR' AND ativo = True
                """)
                total_admins = cur.fetchone()['total']
                if total_admins <= 1:
                    raise HTTPException(
                        status_code=400, 
                        detail="Não é possível alterar o último administrador do sistema"
                    )

            # 6. Altera o tipo
            sql = "UPDATE usuario SET tipo_usuario = %s WHERE id = %s"
            cur.execute(sql, (novo_tipo, usuario_id))
            con.commit()

            return {
                "sucesso": True,
                "mensagem": f"Tipo de usuário alterado para {novo_tipo} com sucesso",
                "usuario_id": usuario_id,
                "novo_tipo": novo_tipo
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