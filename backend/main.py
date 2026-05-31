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

import traceback  # ← Adicione esta importação

"""importações para dados sensíveis do banco"""
from dotenv import load_dotenv
import os

"""importações de models"""
from models.models import Categoria, Usuario, Equipamento, Manutencao

load_dotenv() # Carrega as variáveis de ambiente do arquivo .env

config_db = {
    "host": os.getenv("host"),
    "user": os.getenv("user"),
    "password": os.getenv("password"),
    "database": os.getenv("database"),
    "cursorclass": DictCursor
}

app = FastAPI(debug=True)

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
            "DELETE /excluir_usuario/{usuario_id}": "Excluir usuário"

        }
    }

#===============================================================================================
#                               CRUD - CATEGORIA
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_categoria")
async def criar_categoria(categoria: Categoria):
    """Endpoint para criar uma nova categoria"""
    
    con = pymysql.connect(**config_db)
    cur = con.cursor()
    
    try:
        #categoria.data_criacao = datetime.now() #define a data de criação no momento da inserção
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
        con.rollback()
        traceback.print_exc()  # ← Isso mostra o erro completo
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""READ (listar)"""
@app.get("/listar_categorias")
async def listar_categorias():
    """Endpoint para listar todas as categorias"""
    
    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "SELECT * FROM categoria"
        cur.execute(sql)
        categorias = cur.fetchall()

        return {
            "sucesso": True,
            "categorias": categorias
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""UPDATE (atualizar)"""
@app.put("/atualizar_categoria/{categoria_id}")
async def atualizar_categoria(categoria_id: int, categoria: Categoria):
    """Endpoint para atualizar uma categoria existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "UPDATE categoria SET nome = %s, descricao = %s WHERE id = %s"
        cur.execute(sql, (categoria.nome, categoria.descricao, categoria_id))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Categoria atualizada com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""DELETE (apagar)"""
@app.delete("/excluir_categoria/{categoria_id}")
async def excluir_categoria(categoria_id: int):
    """Endpoint para excluir uma categoria existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "DELETE FROM categoria WHERE id = %s"
        cur.execute(sql, (categoria_id,))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Categoria excluída com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()


#===============================================================================================
#                               CRUD - USUÁRIO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_usuario")
async def criar_usuario(usuario: Usuario):
    """Endpoint para criar um novo usuário"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "INSERT INTO usuario (nome, email, senha) VALUES (%s, %s, %s)"
        cur.execute(sql, (usuario.nome, usuario.email, usuario.senha))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Usuário criado com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

"""READ (listar)"""
@app.get("/listar_usuarios")
async def listar_usuarios():
    """Endpoint para listar apenas os usuários ativos"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
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
        cur.close()
        con.close()

"""UPDATE (atualizar)"""
@app.put("/atualizar_usuario/{usuario_id}")
async def atualizar_usuario(usuario_id: int, usuario: Usuario):
    """Endpoint para atualizar um usuário existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
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
        cur.close()
        con.close()

"""DELETE (inativar)"""
@app.delete("/excluir_usuario/{usuario_id}")
async def excluir_usuario(usuario_id: int):
    """Endpoint para inativar (Soft Delete) um usuário existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
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
        cur.close()
        con.close()


#===============================================================================================
#                               CRUD - EQUIPAMENTO
#===============================================================================================


"""CREATE (criar)"""

@app.post("/criar_equipamento")
async def criar_equipamento(equipamento: Equipamento):
    """Endpoint para criar um novo equipamento"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
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
        cur.close()
        con.close()

"""READ (listar)"""

@app.get("/listar_equipamentos")
async def listar_equipamentos():
    """Endpoint para listar todos os equipamentos"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "SELECT * FROM equipamento"
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
        cur.close()
        con.close()

"""UPDATE (atualizar)"""
@app.put("/atualizar_equipamento/{equipamento_id}")
async def atualizar_equipamento(equipamento_id: int, equipamento: Equipamento):
    """Endpoint para atualizar um equipamento existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "UPDATE equipamento SET codigo_patrimonio = %s, nome = %s, modelo = %s, id_categoria = %s WHERE id = %s"
        cur.execute(sql, (equipamento.codigo_patrimonio, equipamento.nome, equipamento.modelo, equipamento.id_categoria, equipamento.id_categoria))
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
        cur.close()
        con.close()

"""DELETE (apagar)"""
@app.delete("/excluir_equipamento/{equipamento_id}")
async def excluir_equipamento(equipamento_id: int):
    """Endpoint para excluir um equipamento existente"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "DELETE FROM equipamento WHERE id = %s"
        cur.execute(sql, (equipamento_id,))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Equipamento excluído com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()


#===============================================================================================
#                               CRUD - MANUTENÇÃO
#===============================================================================================

""" MODELO da tabela de manutenção do banco de dados

CREATE TABLE manutencao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_equipamento INT NOT NULL,
    descricao_defeito TEXT NOT NULL,
    data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao DATETIME NULL,
    FOREIGN KEY (id_equipamento) REFERENCES equipamento(id) ON DELETE RESTRICT
) ENGINE=InnoDB;


"""

"""CREATE (criar)"""

@app.post("/criar_manutencao")
async def criar_manutencao(manutencao: Manutencao):
    """Endpoint para criar uma nova manutenção"""

    con = pymysql.connect(**config_db)
    cur = con.cursor()

    try:
        sql = "INSERT INTO manutencao (id_equipamento, descricao_defeito, data_conclusao) VALUES (%s, %s, %s)"
        cur.execute(sql, (manutencao.id_equipamento, manutencao.descricao_defeito, manutencao.data_conclusao))
        con.commit()

        return {
            "sucesso": True,
            "mensagem": "Manutenção criada com sucesso"
        }
    except Exception as e:
        con.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        con.close()

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