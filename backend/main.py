#==============================================
# Projeto: GIPAR - Gerenciamento de Projetos Acadêmicos
# Descrição: API para gerenciamento de projetos acadêmicos
# Autores: [Francis, Helen e Ismar]
# Data: [29/05/2026]
# Versão beta teste 1.0 
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
from servicos.email_service import enviar_email
from gerenciador_db.auditoria import AuditoriaRepositorio
from models.models import LogAuditoria
from gerenciador_db.historico import HistoricoRepositorio
from models.models import HistoricoMovimentacao


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
auditoria_repositorio = AuditoriaRepositorio(config_db)
historico_repositorio = HistoricoRepositorio(config_db)

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
            "PUT /atualizar_manutencao/{manutencao_id}": "Atualizar manutenção",
            "DELETE /excluir_manutecao/{manutencao_id}": "Excluir manutenção",
            "POST /criar_reserva": "Criar reserva",
            "GET /listar_reservas": "Listar reservas",
            "PUT /atualizar_reserva/{reserva_id}": "Atualizar reserva",
            "DELETE /excluir_reserva/{reserva_id}": "Excluir reserva",
            "POST /criar_emprestimo": "Criar empréstimo",
            "GET /listar_emprestimos": "Listar empréstimos",
            "PUT /atualizar_emprestimo/{emprestimo_id}": "Atualizar empréstimo",

        }
    }

#===============================================================================================
#                               CRUD - CATEGORIA
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_categoria")
async def criar_categoria(categoria: Categoria):
    """Endpoint para criar uma nova categoria"""
    resultado = await categoria_repositorio.criar_categoria(categoria)
    
    # === Início da Auditoria ===
    novo_log = LogAuditoria(
        id_usuario=1, 
        acao="INSERT", 
        tabela_afetada="categoria",
        id_registro_afetado=resultado.get("id", 0) if isinstance(resultado, dict) else 0,
        detalhes=f"Categoria criada no sistema"
    )
    await auditoria_repositorio.registrar_log(novo_log)
    # === Fim da Auditoria ===

    return resultado

"""READ (listar)"""
@app.get("/listar_categorias")
async def listar_categorias():
    """Endpoint para listar todas as categorias"""
    return await categoria_repositorio.listar_categorias()

"""UPDATE (atualizar)"""
@app.put("/atualizar_categoria/{categoria_id}")
async def atualizar_categoria(categoria_id: int, categoria: Categoria):
    resultado = await categoria_repositorio.atualizar_categoria(categoria_id, categoria)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="categoria",
        id_registro_afetado=categoria_id, detalhes="Categoria atualizada no sistema"
    ))
    return resultado

"""DELETE (apagar)"""
@app.delete("/excluir_categoria/{categoria_id}")
async def excluir_categoria(categoria_id: int):
    resultado = await categoria_repositorio.excluir_categoria(categoria_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="DELETE", tabela_afetada="categoria",
        id_registro_afetado=categoria_id, detalhes="Categoria excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - USUÁRIO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_usuario")
async def criar_usuario(usuario: Usuario):
    resultado = await usuario_repositorio.criar_usuario(usuario)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="INSERT", tabela_afetada="usuario",
        id_registro_afetado=id_registro, detalhes="Usuário criado no sistema"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_usuarios")
async def listar_usuarios():
    """Endpoint para listar apenas os usuários ativos"""
    return await usuario_repositorio.listar_usuarios()

"""UPDATE (atualizar)"""
@app.put("/atualizar_usuario/{usuario_id}")
async def atualizar_usuario(usuario_id: int, usuario: Usuario):
    resultado = await usuario_repositorio.atualizar_usuario(usuario_id, usuario)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário atualizado no sistema"
    ))
    return resultado

"""INACTIVATE (inativar)""" #patch serve para atualizar apenas um campo específico, nesse caso o campo "ativo"
@app.patch("/inativar_usuario/{usuario_id}")
async def inativar_usuario(usuario_id: int):
    resultado = await usuario_repositorio.inativar_usuario(usuario_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário inativado no sistema"
    ))
    return resultado

"""REACTIVATE (reativar)"""
@app.patch("/reativar_usuario/{usuario_id}")
async def reativar_usuario(usuario_id: int):
    resultado = await usuario_repositorio.reativar_usuario(usuario_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário reativado no sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - EQUIPAMENTO
#===============================================================================================


"""CREATE (criar)"""
@app.post("/criar_equipamento")
async def criar_equipamento(equipamento: Equipamento):
    resultado = await equipamento_repositorio.criar_equipamento(equipamento)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="INSERT", tabela_afetada="equipamento",
        id_registro_afetado=id_registro, detalhes="Equipamento criado no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=id_registro,
    id_usuario_acao=1,   # ou o id do usuário logado, se disponível
    descricao_motivo="Equipamento cadastrado no sistema"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_equipamentos")
async def listar_equipamentos():
    """Endpoint para listar apenas os equipamentos ativos"""
    return await equipamento_repositorio.listar_equipamentos()

"""UPDATE (atualizar)"""
@app.put("/atualizar_equipamento/{equipamento_id}")
async def atualizar_equipamento(equipamento_id: int, equipamento: Equipamento):
    resultado = await equipamento_repositorio.atualizar_equipamento(equipamento_id, equipamento)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento atualizado no sistema"
    ))
    return resultado

"""INACTIVATE (inativar)"""
@app.patch("/inativar_equipamento/{equipamento_id}")
async def inativar_equipamento(equipamento_id: int):
    resultado = await equipamento_repositorio.inativar_equipamento(equipamento_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento inativado no sistema"
    ))
    return resultado

"""REACTIVATE (reativar)"""
@app.patch("/reativar_equipamento/{equipamento_id}")
async def reativar_equipamento(equipamento_id: int):
    resultado = await equipamento_repositorio.reativar_equipamento(equipamento_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento reativado no sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - MANUTENÇÃO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_manutencao")
async def criar_manutencao(manutencao: Manutencao):
    resultado = await manutencao_repositorio.criar_manutencao(manutencao)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="INSERT", tabela_afetada="manutencao",
        id_registro_afetado=id_registro, detalhes="Manutenção criada no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=manutencao.id_equipamento,
    id_usuario_acao=1,
    descricao_motivo=f"Manutenção registrada (ID {id_registro})"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_manutencoes")
async def listar_manutencoes():
    """Endpoint para listar todas as manutenções"""
    return await manutencao_repositorio.listar_manutencoes()

"""UPDATE (atualizar)"""
@app.put("/atualizar_manutencao/{manutencao_id}")
async def atualizar_manutencao(manutencao_id: int, manutencao: Manutencao):
    resultado = await manutencao_repositorio.atualizar_manutencao(manutencao_id, manutencao)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="manutencao",
        id_registro_afetado=manutencao_id, detalhes="Manutenção atualizada no sistema"
    ))
    return resultado

"""DELETE (apagar)"""
@app.delete("/excluir_manutencao/{manutencao_id}")
async def excluir_manutencao(manutencao_id: int):
    resultado = await manutencao_repositorio.excluir_manutencao(manutencao_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="DELETE", tabela_afetada="manutencao",
        id_registro_afetado=manutencao_id, detalhes="Manutenção excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - RESERVA
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_reserva")
async def criar_reserva(reserva: Reserva):
    resultado = await reserva_repositorio.criar_reserva(reserva)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="INSERT", tabela_afetada="reserva",
        id_registro_afetado=id_registro, detalhes="Reserva criada no sistema"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_reservas")
async def listar_reservas():
    """Endpoint para listar todas as reservas"""
    return await reserva_repositorio.listar_reservas()

"""UPDATE (atualizar)"""
@app.put("/atualizar_reserva/{reserva_id}")
async def atualizar_reserva(reserva_id: int, reserva: Reserva):
    resultado = await reserva_repositorio.atualizar_reserva(reserva_id, reserva)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="reserva",
        id_registro_afetado=reserva_id, detalhes="Reserva atualizada no sistema"
    ))
    return resultado

"""DELETE (apagar)"""
@app.delete("/excluir_reserva/{reserva_id}")
async def excluir_reserva(reserva_id: int):
    resultado = await reserva_repositorio.excluir_reserva(reserva_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="DELETE", tabela_afetada="reserva",
        id_registro_afetado=reserva_id, detalhes="Reserva excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - EMPRÉSTIMO
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_emprestimo")
async def criar_emprestimo(emprestimo: Emprestimo):
    resultado = await emprestimo_repositorio.criar_emprestimo(emprestimo)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="INSERT", tabela_afetada="emprestimo",
        id_registro_afetado=id_registro, detalhes="Empréstimo criado no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=emprestimo.id_equipamento,
    id_usuario_acao=emprestimo.id_usuario,
    descricao_motivo=f"Empréstimo criado (ID {id_registro})"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_emprestimos")
async def listar_emprestimos():
    """Endpoint para listar todos os empréstimos"""
    return await emprestimo_repositorio.listar_emprestimos()

"""UPDATE (atualizar)"""
@app.put("/atualizar_emprestimo/{emprestimo_id}")
async def atualizar_emprestimo(emprestimo_id: int, emprestimo: Emprestimo):
    resultado = await emprestimo_repositorio.atualizar_emprestimo(emprestimo_id, emprestimo)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=1, acao="UPDATE", tabela_afetada="emprestimo",
        id_registro_afetado=emprestimo_id, detalhes="Empréstimo atualizado no sistema"
    ))
    return resultado

"""ESSE CRUD NÃO POSSUI A FUNÇÃO DELETE, POIS O REGISTRO DE EMPRÉSTIMO DEVE SER MANTIDO
PARA FINS DE HISTÓRICO, LOGS E RELATÓRIOS."""


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

@app.get("/listar_logs")
async def listar_logs(tabela: str = None, id_usuario: int = None):
    """Endpoint para listar os logs de auditoria"""
    return await auditoria_repositorio.listar_logs(tabela, id_usuario)

@app.get("/listar_historico")
async def listar_historico(id_equipamento: int = None):
    """Endpoint para listar o histórico de movimentações (com filtro opcional por equipamento)"""
    return await historico_repositorio.listar_historico(id_equipamento)

