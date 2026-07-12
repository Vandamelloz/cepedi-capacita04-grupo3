#==============================================
# Projeto: GIPAR - Gerenciamento de Projetos Acadêmicos
# Descrição: API para gerenciamento de projetos acadêmicos
# Autores: [Francis, Helen e Yan]
# Data: [29/05/2026]
# Versão beta teste 2.0 
#==============================================

"""Importações de bibliotecas necessárias"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
from models.models import Categoria, Usuario, Equipamento, Manutencao, Reserva, Emprestimo

"""importações de repositórios"""
from gerenciador_db.categoria import CategoriaRepositorio
from gerenciador_db.usuario import UsuarioRepositorio
from gerenciador_db.equipamento import EquipamentoRepositorio
from gerenciador_db.manutencao import ManutencaoRepositorio
from gerenciador_db.reserva import ReservaRepositorio
from gerenciador_db.emprestimo import EmprestimoRepositorio
from gerenciador_db.historico import HistoricoRepositorio
from servicos.email_service import enviar_email


load_dotenv() # Carrega as variáveis de ambiente do arquivo .env

config_db = {
    "host": os.getenv("host"),
    "user": os.getenv("user"),
    "password": os.getenv("password"),
    "database": os.getenv("database"),
    "cursorclass": DictCursor
}

app = FastAPI(debug=True)

# Configuração de CORS (Essencial para o Frontend React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir conexões de qualquer origem (em dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""Instância de classe Para controle das tabelas do banco de dados"""
categoria_repositorio = CategoriaRepositorio(config_db)
usuario_repositorio = UsuarioRepositorio(config_db)
equipamento_repositorio = EquipamentoRepositorio(config_db)
manutencao_repositorio = ManutencaoRepositorio(config_db)
reserva_repositorio = ReservaRepositorio(config_db)
emprestimo_repositorio = EmprestimoRepositorio(config_db)
historico_repositorio = HistoricoRepositorio(config_db)

emprestimo_repositorio.set_historico_repositorio(historico_repositorio)
manutencao_repositorio.set_historico_repositorio(historico_repositorio)
reserva_repositorio.set_historico_repositorio(historico_repositorio)

emprestimo_repositorio.set_reserva_repositorio(reserva_repositorio)

@app.get("/")
async def home():
    """Endpoint de teste para verificar se a API está funcionando"""
    return {
        "mensagem": "Bem-vindo à API do GIPAR!",
        "versao": "2.0",
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
            "PUT /atualizar_manutencao/{manutencao_id}": "Atualizar manutenção",
            "DELETE /excluir_manutecao/{manutencao_id}": "Excluir manutenção",
            "POST /criar_reserva": "Criar reserva",
            "GET /listar_reservas": "Listar reservas",
            "PUT /atualizar_reserva/{reserva_id}": "Atualizar reserva",
            "DELETE /excluir_reserva/{reserva_id}": "Excluir reserva",
            "POST /criar_emprestimo": "Criar empréstimo",
            "GET /listar_emprestimos": "Listar empréstimos",
            "PUT /atualizar_emprestimo/{emprestimo_id}": "Atualizar empréstimo",
            "PATCH /registrar_devolucao/{emprestimo_id}": "Registrar devolução",
            "GET /listar_historico": "Listar histórico",

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

from models.models import Usuario, TipoUsuario

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

"""READ (listar por tipo)"""
@app.get("/listar_usuarios/tipo/{tipo}")
async def listar_usuarios_por_tipo(tipo: str):
    """Endpoint para listar usuários por tipo (ADMINISTRADOR, TECNICO, COMUM)"""
    return await usuario_repositorio.listar_usuarios_por_tipo(tipo)

"""READ (buscar um)"""
@app.get("/buscar_usuario/{usuario_id}")
async def buscar_usuario(usuario_id: int):
    """Endpoint para buscar um usuário específico pelo ID"""
    return await usuario_repositorio.buscar_usuario(usuario_id)

"""UPDATE (atualizar)"""
@app.put("/atualizar_usuario/{usuario_id}")
async def atualizar_usuario(usuario_id: int, usuario: Usuario):
    """Endpoint para atualizar um usuário existente"""
    return await usuario_repositorio.atualizar_usuario(usuario_id, usuario)

"""UPDATE (alterar tipo)"""
@app.patch("/alterar_tipo_usuario/{usuario_id}")
async def alterar_tipo_usuario(usuario_id: int, novo_tipo: str, admin_id: int):
    """Endpoint para alterar o tipo de usuário (apenas administradores)"""
    return await usuario_repositorio.alterar_tipo_usuario(usuario_id, novo_tipo, admin_id)

"""INACTIVATE (inativar)"""
@app.patch("/inativar_usuario/{usuario_id}")
async def inativar_usuario(usuario_id: int):
    """Endpoint para inativar (Soft Delete) um usuário existente"""
    return await usuario_repositorio.inativar_usuario(usuario_id)

"""REACTIVATE (reativar)"""
@app.patch("/reativar_usuario/{usuario_id}")
async def reativar_usuario(usuario_id: int):
    """Endpoint para reativar um usuário existente"""
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

@app.post("/criar_manutencao")
async def criar_manutencao(manutencao: Manutencao):
    """Endpoint para criar uma nova manutenção"""
    return await manutencao_repositorio.criar_manutencao(manutencao)

@app.get("/listar_manutencoes")
async def listar_manutencoes():
    """Endpoint para listar todas as manutenções"""
    return await manutencao_repositorio.listar_manutencoes()

@app.put("/atualizar_manutencao/{manutencao_id}")
async def atualizar_manutencao(manutencao_id: int, manutencao: Manutencao):
    """Endpoint para atualizar uma manutenção existente"""
    return await manutencao_repositorio.atualizar_manutencao(manutencao_id, manutencao)


#===============================================================================================
#                               CRUD - RESERVA
#===============================================================================================

@app.post("/criar_reserva")
async def criar_reserva(reserva: Reserva):
    """Endpoint para criar uma nova reserva"""
    return await reserva_repositorio.criar_reserva(reserva)

@app.get("/listar_reservas")
async def listar_reservas():
    """Endpoint para listar todas as reservas"""
    return await reserva_repositorio.listar_reservas()

@app.put("/atualizar_reserva/{reserva_id}")
async def atualizar_reserva(reserva_id: int, reserva: Reserva):
    """Endpoint para atualizar uma reserva existente"""
    return await reserva_repositorio.atualizar_reserva(reserva_id, reserva)

@app.delete("/excluir_reserva/{reserva_id}")
async def excluir_reserva(reserva_id: int):
    """Endpoint para cancelar uma reserva"""
    return await reserva_repositorio.excluir_reserva(reserva_id)


#===============================================================================================
#                               CRUD - EMPRÉSTIMO
#===============================================================================================

@app.post("/criar_emprestimo")
async def criar_emprestimo(emprestimo: Emprestimo):
    """Endpoint para criar um novo empréstimo"""
    return await emprestimo_repositorio.criar_emprestimo(emprestimo)

@app.get("/listar_emprestimos")
async def listar_emprestimos(apenas_ativos: bool = False):
    """Endpoint para listar todos os empréstimos"""
    return await emprestimo_repositorio.listar_emprestimos(apenas_ativos)

@app.patch("/registrar_devolucao/{emprestimo_id}")
async def registrar_devolucao(emprestimo_id: int, id_tecnico_retorno: int):
    """Endpoint para registrar a devolução de um equipamento"""
    return await emprestimo_repositorio.registrar_devolucao(emprestimo_id, id_tecnico_retorno)

"""ESSE CRUD NÃO POSSUI A FUNÇÃO DELETE, POIS O REGISTRO DE EMPRÉSTIMO DEVE SER MANTIDO
PARA FINS DE HISTÓRICO, LOGS E RELATÓRIOS."""

#===============================================================================================
#                               CRUD - HISTÓRICO
#===============================================================================================

"""READ (listar)"""
@app.get("/listar_historico")
async def listar_historico(id_equipamento: int = None):
    """Endpoint para listar todo o histórico (com filtro opcional por equipamento)"""
    return await historico_repositorio.listar_historico(id_equipamento)


#===============================================================================================
#                               SERVIÇOS EXTRAS
#===============================================================================================

class EmailRequest(BaseModel):
    destinatario: str
    assunto: str
    corpo: str

@app.post("/testar-email")
async def testar_email(req: EmailRequest):
    """Endpoint para testar a integração do disparo de e-mails"""
    try:
        sucesso = enviar_email(req.destinatario, req.assunto, req.corpo)
        if sucesso:
            return {"sucesso": True, "mensagem": f"E-mail enviado com sucesso para {req.destinatario}!"}
        else:
            raise HTTPException(status_code=500, detail="Falha ao enviar e-mail. Verifique o console do servidor.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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