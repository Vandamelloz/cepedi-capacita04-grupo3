#==============================================
# Projeto: GIPAR - Gerenciamento de Projetos Acadêmicos
# Descrição: API para gerenciamento de projetos acadêmicos
# Autores: [Francis, Helen e Ismar]
# Data: [29/05/2026]
# Versão beta teste 1.0 
#==============================================

"""Importações de bibliotecas necessárias"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from seguranca import verificar_senha, criar_token_acesso
import traceback 

"""importações para dados sensíveis do banco"""
from dotenv import load_dotenv
import os

"""importações de models"""
from models.models import Categoria, Usuario, Equipamento, Manutencao

"""importações de repositórios"""
from gerenciador_db.categoria import CategoriaRepositorio
from gerenciador_db.usuario import UsuarioRepositorio
from gerenciador_db.equipamento import EquipamentoRepositorio
from gerenciador_db.manutencao import ManutencaoRepositorio


load_dotenv() # Carrega as variáveis de ambiente do arquivo .env

config_db = {
    "host": os.getenv("host"),
    "user": os.getenv("user"),
    "password": os.getenv("password"),
    "database": os.getenv("database"),
    "cursorclass": DictCursor
}

app = FastAPI(debug=True)

"""Instância de classe Para controle das tabelas do banco de dados"""
categoria_repositorio = CategoriaRepositorio(config_db)
usuario_repositorio = UsuarioRepositorio(config_db)
equipamento_repositorio = EquipamentoRepositorio(config_db)
manutencao_repositorio = ManutencaoRepositorio(config_db)

@app.get("/")
async def home():
    """Endpoint de teste para verificar se a API está funcionando"""
    return {
        "mensagem": "Bem-vindo à API do GIPAR!",
        "versao": "1.0",
        "instrucoes": "Acesse /docs para usar a interface web",
        "endpoints": {
            "GET /": "Esta mensagem",
            "POST /criar_categoria": "Criar categoria",
            "GET /listar_categorias": "Listar categorias",
            "PUT /atualizar_categoria/{categoria_id}": "Atualizar categoria",
            "DELETE /excluir_categoria/{categoria_id}": "Excluir categoria",
            "POST /criar_usuario": "Criar usuário",
            "GET /listar_usuarios": "Listar usuários",
            "PUT /atualizar_usuario/{usuario_id}": "Atualizar usuário",
            "PATCH /inativar_usuario/{usuario_id}": "Inativar usuário",
            "PATCH /reativar_usuario/{usuario_id}": "Reativar usuário",
            "POST /criar_equipamento": "Criar equipamento",
            "GET /listar_equipamentos": "Listar equioamentos",
            "PUT /atualizar_equipamento/{equipamento_id}": "Atualizar equipamento",
            "PATCH /inativar_equipamento/{equipamento_id}": "Inativar equipamento",
            "PATCH / reativar_equipamento/{equipamento_id}": "Reativar equipamento",
            "POSR /criar_manutencao": "Criar manutenção",
            "GET /listar_manutencoes": "Listar manuteções",

        }
    }

#===============================================================================================
#                               CRUD - CATEGORIA
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_categoria")
async def criar_categoria(categoria: Categoria):
    """Endpoint para criar uma nova categoria"""
    return await categoria_repositorio.criar_categoria(categoria)

"""READ (listar)"""
@app.get("/listar_categorias")
async def listar_categorias():
    """Endpoint para listar todas as categorias"""
    return await categoria_repositorio.listar_categorias()

"""UPDATE (atualizar)"""
@app.put("/atualizar_categoria/{categoria_id}")
async def atualizar_categoria(categoria_id: int, categoria: Categoria):
    """Endpoint para atualizar uma categoria existente"""
    return await categoria_repositorio.atualizar_categoria(categoria_id, categoria)

"""DELETE (apagar)"""
@app.delete("/excluir_categoria/{categoria_id}")
async def excluir_categoria(categoria_id: int):
    """Endpoint para excluir uma categoria existente"""
    return await categoria_repositorio.excluir_categoria(categoria_id)


#===============================================================================================
#                               CRUD - USUÁRIO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_usuario")
async def criar_usuario(usuario: Usuario):
    """Endpoint para criar um novo usuário"""
    return await usuario_repositorio.criar_usuario(usuario)

"""READ (listar)"""
@app.get("/listar_usuarios")
async def listar_usuarios():
    """Endpoint para listar apenas os usuários ativos"""
    return await usuario_repositorio.listar_usuarios()

"""UPDATE (atualizar)"""
@app.put("/atualizar_usuario/{usuario_id}")
async def atualizar_usuario(usuario_id: int, usuario: Usuario):
    """Endpoint para atualizar um usuário existente"""
    return await usuario_repositorio.atualizar_usuario(usuario_id, usuario)

"""INACTIVATE (inativar)""" #patch serve para atualizar apenas um campo específico, nesse caso o campo "ativo"
@app.patch("/inativar_usuario/{usuario_id}")
async def inativar_usuario(usuario_id: int):
    """Endpoint para inativar (Soft Delete) um usuário existente"""
    return await usuario_repositorio.inativar_usuario(usuario_id)

"""REACTIVATE (reativar)"""
@app.patch("/reativar_usuario/{usuario_id}")
async def reativar_usuario(usuario_id: int):
    """Endpoint para reativar (Soft Delete) um usuário existente"""
    return await usuario_repositorio.reativar_usuario(usuario_id)


#===============================================================================================
#                               CRUD - EQUIPAMENTO
#===============================================================================================


"""CREATE (criar)"""
@app.post("/criar_equipamento")
async def criar_equipamento(equipamento: Equipamento):
    """Endpoint para criar um novo equipamento"""
    return await equipamento_repositorio.criar_equipamento(equipamento)

"""READ (listar)"""
@app.get("/listar_equipamentos")
async def listar_equipamentos():
    """Endpoint para listar apenas os equipamentos ativos"""
    return await equipamento_repositorio.listar_equipamentos()

"""UPDATE (atualizar)"""
@app.put("/atualizar_equipamento/{equipamento_id}")
async def atualizar_equipamento(equipamento_id: int, equipamento: Equipamento):
    """Endpoint para atualizar um equipamento existente"""
    return await equipamento_repositorio.atualizar_equipamento(equipamento_id, equipamento)

"""INACTIVATE (inativar)"""
@app.patch("/inativar_equipamento/{equipamento_id}")
async def inativar_equipamento(equipamento_id: int):
    """Endpoint para inativar (Soft Delete) um equipamento existente"""
    return await equipamento_repositorio.inativar_equipamento(equipamento_id)

"""REACTIVATE (reativar)"""
@app.patch("/reativar_equipamento/{equipamento_id}")
async def reativar_equipamento(equipamento_id: int):
    """Endpoint para reativar (Soft Delete) um equipamento existente"""
    return await equipamento_repositorio.reativar_equipamento(equipamento_id)


#===============================================================================================
#                               CRUD - MANUTENÇÃO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_manutencao")
async def criar_manutencao(manutencao: Manutencao):
    """Endpoint para criar uma nova manutenção"""
    return await manutencao_repositorio.criar_manutencao(manutencao)

"""READ (listar)"""
@app.get("/listar_manutencoes")
async def listar_manutencoes():
    """Endpoint para listar todas as manutenções"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "SELECT * FROM manutencao"
        cur.execute(sql)
        manutencoes = cur.fetchall()

        return {
            "sucesso": True,
            "manutencoes": manutencoes
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""UPDATE (atualizar)"""
@app.put("/atualizar_manutencao/{manutencao_id}")
async def atualizar_manutencao(manutencao_id: int, manutencao: Manutencao):
    """Endpoint para atualizar uma manutenção existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "UPDATE manutencao SET id_equipamento = %s, descricao_defeito = %s, data_conclusao = %s WHERE id = %s"
        cur.execute(sql, (manutencao.id_equipamento, manutencao.descricao_defeito, manutencao.data_conclusao, manutencao_id))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Manutenção atualizada com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""DELETE (apagar)"""
@app.delete("/excluir_manutencao/{manutencao_id}")
async def excluir_manutencao(manutencao_id: int):
    """Endpoint para excluir uma manutenção existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "DELETE FROM manutencao WHERE id = %s"
        cur.execute(sql, (manutencao_id,))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Manutenção excluída com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()
#Rota para login
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    con = pymysql.connect(**config_db)
    cur = con.cursor()
    
    try:
        sql = "SELECT id, email, senha FROM usuario WHERE email = %s AND ativo = True"
        cur.execute(sql, (form_data.username,))
        usuario_db = cur.fetchone()

        if not usuario_db or not verificar_senha(form_data.password, usuario_db['senha']):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")

        token_acesso = criar_token_acesso(dados={"sub": usuario_db['email'], "id": usuario_db['id']})
        
        return {"access_token": token_acesso, "token_type": "bearer"}
    finally:
        cur.close()
        con.close()