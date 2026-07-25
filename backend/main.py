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
from fpdf import FPDF
from fastapi.responses import Response
import csv
import io
from pydantic import BaseModel
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from seguranca import verificar_permissao, verificar_senha, criar_token_acesso, obter_usuario_atual
import traceback 

"""importações para dados sensíveis do banco"""
from dotenv import load_dotenv
import os

"""importações de models"""
from models.models import Categoria, Usuario, Equipamento, Manutencao, Reserva, Emprestimo, TipoUsuario

"""importações de repositórios"""
from gerenciador_db.categoria import CategoriaRepositorio
from gerenciador_db.usuario import UsuarioRepositorio
from gerenciador_db.equipamento import EquipamentoRepositorio
from gerenciador_db.manutencao import ManutencaoRepositorio
from gerenciador_db.reserva import ReservaRepositorio
from gerenciador_db.emprestimo import EmprestimoRepositorio
from gerenciador_db.historico import HistoricoRepositorio
from servicos.email_service import enviar_email
from servicos.dashboard import DashboardService
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
dashboard_service = DashboardService(config_db)

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
            "PATCH /reativar_equipamento/{equipamento_id}": "Reativar equipamento",
            "POST /criar_manutencao": "Criar manutenção",
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
            "GET /dashboard/estatisticas": "Estatísticas do dashboard",

        }
    }

PERMISSAO_ADMIN = Depends(verificar_permissao(["ADMINISTRADOR"]))
PERMISSAO_TECNICO = Depends(verificar_permissao(["ADMINISTRADOR", "TECNICO"]))

#===============================================================================================
#                               CRUD - CATEGORIA
#===============================================================================================

"""CREATE (criar)"""
@app.post("/criar_categoria", dependencies=[PERMISSAO_ADMIN])
async def criar_categoria(categoria: Categoria,
    usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para criar uma nova categoria"""
    resultado = await categoria_repositorio.criar_categoria(categoria)
    
    # === Início da Auditoria ===
    novo_log = LogAuditoria(
        id_usuario=usuario_logado["id"], 
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
async def listar_categorias(usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar todas as categorias"""
    return await categoria_repositorio.listar_categorias()

"""UPDATE (atualizar)"""
@app.put("/atualizar_categoria/{categoria_id}",  dependencies=[PERMISSAO_ADMIN])
async def atualizar_categoria(categoria_id: int, categoria: Categoria, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await categoria_repositorio.atualizar_categoria(categoria_id, categoria)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="categoria",
        id_registro_afetado=categoria_id, detalhes="Categoria atualizada no sistema"
    ))
    return resultado

"""DELETE (apagar)"""
@app.delete("/excluir_categoria/{categoria_id}",dependencies=[PERMISSAO_ADMIN])
async def excluir_categoria(categoria_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await categoria_repositorio.excluir_categoria(categoria_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="DELETE", tabela_afetada="categoria",
        id_registro_afetado=categoria_id, detalhes="Categoria excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - USUÁRIO
#===============================================================================================


"""CREATE (criar)"""
@app.post("/criar_usuario", dependencies=[PERMISSAO_ADMIN])
async def criar_usuario(usuario: Usuario, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await usuario_repositorio.criar_usuario(usuario)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="INSERT", tabela_afetada="usuario",
        id_registro_afetado=id_registro, detalhes="Usuário criado no sistema"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_usuarios", dependencies=[PERMISSAO_TECNICO])
async def listar_usuarios(usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar apenas os usuários ativos"""
    return await usuario_repositorio.listar_usuarios()

"""READ (listar por tipo)"""
@app.get("/listar_usuarios/tipo/{tipo}", dependencies=[PERMISSAO_TECNICO])
async def listar_usuarios_por_tipo(tipo: str, usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar usuários por tipo (ADMINISTRADOR, TECNICO, COMUM)"""
    return await usuario_repositorio.listar_usuarios_por_tipo(tipo)

"""READ (buscar um)"""
@app.get("/buscar_usuario/{usuario_id}", dependencies=[PERMISSAO_TECNICO])
async def buscar_usuario(usuario_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para buscar um usuário específico pelo ID"""
    return await usuario_repositorio.buscar_usuario(usuario_id)

"""UPDATE (atualizar)"""
@app.put("/atualizar_usuario/{usuario_id}", dependencies=[PERMISSAO_ADMIN])
async def atualizar_usuario(usuario_id: int, usuario: Usuario, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await usuario_repositorio.atualizar_usuario(usuario_id, usuario)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário atualizado no sistema"
    ))
    return resultado

"""UPDATE (alterar tipo)"""
@app.patch("/alterar_tipo_usuario/{usuario_id}",  dependencies=[PERMISSAO_ADMIN])
async def alterar_tipo_usuario(usuario_id: int, novo_tipo: str, admin_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para alterar o tipo de usuário (apenas administradores)"""
    return await usuario_repositorio.alterar_tipo_usuario(usuario_id, novo_tipo, admin_id)

"""INACTIVATE (inativar)"""
@app.patch("/inativar_usuario/{usuario_id}", dependencies=[PERMISSAO_ADMIN])
async def inativar_usuario(usuario_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await usuario_repositorio.inativar_usuario(usuario_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário inativado no sistema"
    ))
    return resultado

"""REACTIVATE (reativar)"""
@app.patch("/reativar_usuario/{usuario_id}", dependencies=[PERMISSAO_ADMIN])
async def reativar_usuario(usuario_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await usuario_repositorio.reativar_usuario(usuario_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="usuario",
        id_registro_afetado=usuario_id, detalhes="Usuário reativado no sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - EQUIPAMENTO
#===============================================================================================


"""CREATE (criar)"""
@app.post("/criar_equipamento", dependencies=[PERMISSAO_TECNICO])
async def criar_equipamento(equipamento: Equipamento, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await equipamento_repositorio.criar_equipamento(equipamento)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="INSERT", tabela_afetada="equipamento",
        id_registro_afetado=id_registro, detalhes="Equipamento criado no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=id_registro,
    id_usuario_acao=usuario_logado["id"],   # ou o id do usuário logado, se disponível
    descricao_motivo="Equipamento cadastrado no sistema"
    ))
    return resultado

"""READ (listar)"""
@app.get("/listar_equipamentos")
async def listar_equipamentos( usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar apenas os equipamentos ativos"""
    return await equipamento_repositorio.listar_equipamentos()

"""UPDATE (atualizar)"""
@app.put("/atualizar_equipamento/{equipamento_id}", dependencies=[PERMISSAO_TECNICO])
async def atualizar_equipamento(equipamento_id: int, equipamento: Equipamento, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await equipamento_repositorio.atualizar_equipamento(equipamento_id, equipamento)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento atualizado no sistema"
    ))
    return resultado

"""INACTIVATE (inativar)"""
@app.patch("/inativar_equipamento/{equipamento_id}", dependencies=[PERMISSAO_TECNICO])
async def inativar_equipamento(equipamento_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await equipamento_repositorio.inativar_equipamento(equipamento_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento inativado no sistema"
    ))
    return resultado

"""REACTIVATE (reativar)"""
@app.patch("/reativar_equipamento/{equipamento_id}", dependencies=[PERMISSAO_TECNICO])
async def reativar_equipamento(equipamento_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await equipamento_repositorio.reativar_equipamento(equipamento_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="equipamento",
        id_registro_afetado=equipamento_id, detalhes="Equipamento reativado no sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - MANUTENÇÃO
#===============================================================================================

@app.post("/criar_manutencao", dependencies=[PERMISSAO_TECNICO])
async def criar_manutencao(manutencao: Manutencao, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await manutencao_repositorio.criar_manutencao(manutencao)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="INSERT", tabela_afetada="manutencao",
        id_registro_afetado=id_registro, detalhes="Manutenção criada no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=manutencao.id_equipamento,
    id_usuario_acao=usuario_logado["id"],
    descricao_motivo=f"Manutenção registrada (ID {id_registro})"
    ))
    return resultado

@app.get("/listar_manutencoes")
async def listar_manutencoes(usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar todas as manutenções"""
    return await manutencao_repositorio.listar_manutencoes()

@app.put("/atualizar_manutencao/{manutencao_id}", dependencies=[PERMISSAO_TECNICO])
async def atualizar_manutencao(manutencao_id: int, manutencao: Manutencao, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await manutencao_repositorio.atualizar_manutencao(manutencao_id, manutencao)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="manutencao",
        id_registro_afetado=manutencao_id, detalhes="Manutenção atualizada no sistema"
    ))
    return resultado

"""DELETE (apagar)"""
@app.delete("/excluir_manutencao/{manutencao_id}", dependencies=[PERMISSAO_TECNICO])
async def excluir_manutencao(manutencao_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await manutencao_repositorio.excluir_manutencao(manutencao_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="DELETE", tabela_afetada="manutencao",
        id_registro_afetado=manutencao_id, detalhes="Manutenção excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - RESERVA
#===============================================================================================

@app.post("/criar_reserva", dependencies=[PERMISSAO_TECNICO])
async def criar_reserva(reserva: Reserva, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await reserva_repositorio.criar_reserva(reserva)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="INSERT", tabela_afetada="reserva",
        id_registro_afetado=id_registro, detalhes="Reserva criada no sistema"
    ))
    return resultado

@app.get("/listar_reservas")
async def listar_reservas(usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar todas as reservas"""
    return await reserva_repositorio.listar_reservas()

@app.put("/atualizar_reserva/{reserva_id}", dependencies=[PERMISSAO_TECNICO])
async def atualizar_reserva(reserva_id: int, reserva: Reserva, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await reserva_repositorio.atualizar_reserva(reserva_id, reserva)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="reserva",
        id_registro_afetado=reserva_id, detalhes="Reserva atualizada no sistema"
    ))
    return resultado

@app.delete("/excluir_reserva/{reserva_id}", dependencies=[PERMISSAO_TECNICO])
async def excluir_reserva(reserva_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await reserva_repositorio.excluir_reserva(reserva_id)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="DELETE", tabela_afetada="reserva",
        id_registro_afetado=reserva_id, detalhes="Reserva excluída do sistema"
    ))
    return resultado


#===============================================================================================
#                               CRUD - EMPRÉSTIMO
#===============================================================================================

@app.post("/criar_emprestimo", dependencies=[PERMISSAO_TECNICO])
async def criar_emprestimo(emprestimo: Emprestimo, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await emprestimo_repositorio.criar_emprestimo(emprestimo)
    id_registro = resultado.get("id", 0) if isinstance(resultado, dict) else getattr(resultado, "id", 0)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="INSERT", tabela_afetada="emprestimo",
        id_registro_afetado=id_registro, detalhes="Empréstimo criado no sistema"
    ))
    await historico_repositorio.registrar_movimentacao(HistoricoMovimentacao(
    id_equipamento=emprestimo.id_equipamento,
    id_usuario_acao=usuario_logado["id"],
    descricao_motivo=f"Empréstimo criado (ID {id_registro})"
    ))
    return resultado

@app.get("/listar_emprestimos")
async def listar_emprestimos(apenas_ativos: bool = False, usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para listar todos os empréstimos"""
    return await emprestimo_repositorio.listar_emprestimos(apenas_ativos)

"""UPDATE (atualizar)"""
@app.put("/atualizar_emprestimo/{emprestimo_id}", dependencies=[PERMISSAO_TECNICO])
async def atualizar_emprestimo(emprestimo_id: int, emprestimo: Emprestimo, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await emprestimo_repositorio.atualizar_emprestimo(emprestimo_id, emprestimo)
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="emprestimo",
        id_registro_afetado=emprestimo_id, detalhes="Empréstimo atualizado no sistema"
    ))
    return resultado

"""UPDATE (devolver)"""
@app.put("/devolver_emprestimo/{emprestimo_id}", dependencies=[PERMISSAO_TECNICO])
async def devolver_emprestimo(emprestimo_id: int, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await emprestimo_repositorio.registrar_devolucao(emprestimo_id, usuario_logado["id"])
    
    await auditoria_repositorio.registrar_log(LogAuditoria(
        id_usuario=usuario_logado["id"], acao="UPDATE", tabela_afetada="emprestimo",
        id_registro_afetado=emprestimo_id, detalhes="Devolução de equipamento registrada"
    ))
    return resultado

"""ESSE CRUD NÃO POSSUI A FUNÇÃO DELETE, POIS O REGISTRO DE EMPRÉSTIMO DEVE SER MANTIDO
PARA FINS DE HISTÓRICO, LOGS E RELATÓRIOS."""

"""GERAR RELATÓRIO (CSV E PDF) COM FILTRO DE DATAS"""
@app.get("/relatorios/emprestimos", dependencies=[PERMISSAO_TECNICO])
async def relatorio_emprestimos(
    formato: str = "csv", 
    data_inicial: str = None, 
    data_final: str = None, 
    usuario_logado: dict = Depends(obter_usuario_atual)
):
    """Endpoint para baixar o relatório de empréstimos em formato CSV ou PDF"""
    
    # 1. Puxa os dados usando a função que já existe no seu banco
    resultado = await emprestimo_repositorio.listar_emprestimos()
    emprestimos = resultado.get("emprestimos", [])

    # 2. Filtra pelas datas (se o frontend enviar)
    if data_inicial and data_final:
        emprestimos_filtrados = []
        for emp in emprestimos:
            data_ret = str(emp.get("data_retirada", ""))[:10]  # Pega só a parte AAAA-MM-DD
            if data_ret and data_inicial <= data_ret <= data_final:
                emprestimos_filtrados.append(emp)
        emprestimos = emprestimos_filtrados

    # 3. Se pedirem CSV:
    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Equipamento", "Patrimonio", "Usuario", "Data Retirada", "Status"])
        
        for emp in emprestimos:
            writer.writerow([
                emp.get("emprestimo_id", ""),
                emp.get("nome_equipamento", ""),
                emp.get("codigo_patrimonio", ""),
                emp.get("nome_usuario", ""),
                emp.get("data_retirada", ""),
                emp.get("status", "")
            ])
            
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=relatorio_emprestimos.csv"}
        )

    # 4. Se pedirem PDF:
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Título
        pdf.cell(200, 10, txt="Relatorio de Emprestimos", ln=True, align='C')
        pdf.ln(5)
        
        # Cabeçalho da Tabela
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(15, 10, "ID", 1)
        pdf.cell(45, 10, "Equipamento", 1)
        pdf.cell(35, 10, "Patrimonio", 1)
        pdf.cell(45, 10, "Usuario", 1)
        pdf.cell(25, 10, "Data", 1)
        pdf.cell(25, 10, "Status", 1)
        pdf.ln()
        
        # Linhas da Tabela
        pdf.set_font("Arial", size=9)
        for emp in emprestimos:
            pdf.cell(15, 10, str(emp.get("emprestimo_id", "")), 1)
            pdf.cell(45, 10, str(emp.get("nome_equipamento", ""))[:20], 1)
            pdf.cell(35, 10, str(emp.get("codigo_patrimonio", ""))[:15], 1)
            pdf.cell(45, 10, str(emp.get("nome_usuario", ""))[:20], 1)
            pdf.cell(25, 10, str(emp.get("data_retirada", ""))[:10], 1)
            pdf.cell(25, 10, str(emp.get("status", ""))[:10], 1)
            pdf.ln()
        
        # Gera o PDF em bytes para enviar pro Front
        pdf_bytes = pdf.output(dest='S').encode('latin1')
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=relatorio_emprestimos.pdf"}
        )
    
    # 5.Formato errado:
    else:
        raise HTTPException(status_code=400, detail="Formato invalido. Use ?formato=csv ou ?formato=pdf")


"""GERAR RELATÓRIO DE EQUIPAMENTOS (CSV E PDF)"""
@app.get("/relatorios/equipamentos", dependencies=[PERMISSAO_TECNICO])
async def relatorio_equipamentos(formato: str = "csv", usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await equipamento_repositorio.listar_equipamentos()
    equipamentos = resultado.get("equipamentos", [])

    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Patrimonio", "Nome", "Modelo"])
        for eq in equipamentos:
            writer.writerow([eq.get("id", ""), eq.get("codigo_patrimonio", ""), eq.get("nome", ""), eq.get("modelo", "")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=relatorio_equipamentos.csv"})
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Relatorio de Equipamentos", ln=True, align='C')
        pdf.ln(5)
        pdf.set_font("Arial", size=9)
        for eq in equipamentos:
            pdf.cell(0, 10, f"ID: {eq.get('id')} | Pat: {eq.get('codigo_patrimonio')} | Nome: {eq.get('nome')} | Mod: {eq.get('modelo')}", 1, 1)
        return Response(content=pdf.output(dest='S').encode('latin1'), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=relatorios.pdf"})
    raise HTTPException(status_code=400, detail="Formato invalido")

"""GERAR RELATÓRIO DE USUÁRIOS (CSV E PDF)"""
@app.get("/relatorios/usuarios", dependencies=[PERMISSAO_TECNICO])
async def relatorio_usuarios(formato: str = "csv", usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await usuario_repositorio.listar_usuarios()
    usuarios = resultado.get("usuarios", [])
    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Nome", "Email", "Tipo"])
        for u in usuarios:
            writer.writerow([u.get("id", ""), u.get("nome", ""), u.get("email", ""), u.get("tipo_usuario", "")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=relatorio_usuarios.csv"})
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt="Relatorio de Usuarios", ln=True, align='C')
        for u in usuarios:
            pdf.cell(0, 10, f"ID: {u.get('id')} | Nome: {u.get('nome')} | Email: {u.get('email')} | Tipo: {u.get('tipo_usuario')}", 1, 1)
        return Response(content=pdf.output(dest='S').encode('latin1'), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=usuarios.pdf"})
    raise HTTPException(status_code=400, detail="Formato invalido")

"""GERAR RELATÓRIO DE MANUTENÇÕES (CSV E PDF)"""
@app.get("/relatorios/manutencoes", dependencies=[PERMISSAO_TECNICO])
async def relatorio_manutencoes(formato: str = "csv", data_inicial: str = None, data_final: str = None, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await manutencao_repositorio.listar_manutencoes()
    manutencoes = resultado.get("manutencoes", [])

    if data_inicial and data_final:
        manutencoes_filtradas = []
        for m in manutencoes:
            data_ab = str(m.get("data_abertura", ""))[:10]
            if data_ab and data_inicial <= data_ab <= data_final:
                manutencoes_filtradas.append(m)
        manutencoes = manutencoes_filtradas
        
    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Equipamento", "Defeito", "Abertura"])
        for m in manutencoes:
            writer.writerow([m.get("id", ""), m.get("id_equipamento", ""), m.get("descricao_defeito", ""), m.get("data_abertura", "")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=relatorio_manutencoes.csv"})
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt="Relatorio de Manutencoes", ln=True, align='C')
        for m in manutencoes:
            pdf.cell(0, 10, f"ID: {m.get('id')} | Eqp: {m.get('id_equipamento')} | Defeito: {str(m.get('descricao_defeito'))[:30]} | Data: {m.get('data_abertura')}", 1, 1)
        return Response(content=pdf.output(dest='S').encode('latin1'), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=manutencoes.pdf"})
    raise HTTPException(status_code=400, detail="Formato invalido")

"""GERAR RELATÓRIO DE RESERVAS (CSV E PDF)"""
@app.get("/relatorios/reservas", dependencies=[PERMISSAO_TECNICO])
async def relatorio_reservas(formato: str = "csv", data_inicial: str = None, data_final: str = None, usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await reserva_repositorio.listar_reservas()
    reservas = resultado.get("reservas", [])

    if data_inicial and data_final:
        reservas_filtradas = []
        for r in reservas:
            data_res = str(r.get("data_reserva", ""))[:10]
            if data_res and data_inicial <= data_res <= data_final:
                reservas_filtradas.append(r)
        reservas = reservas_filtradas
        
    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Equipamento", "Usuario", "Data"])
        for r in reservas:
            writer.writerow([r.get("id", ""), r.get("id_equipamento", ""), r.get("id_usuario", ""), r.get("data_reserva", "")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=relatorio_reservas.csv"})
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt="Relatorio de Reservas", ln=True, align='C')
        for r in reservas:
            pdf.cell(0, 10, f"ID: {r.get('id')} | Eqp: {r.get('id_equipamento')} | Usu: {r.get('id_usuario')} | Data: {r.get('data_reserva')}", 1, 1)
        return Response(content=pdf.output(dest='S').encode('latin1'), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=reservas.pdf"})
    raise HTTPException(status_code=400, detail="Formato invalido")

"""GERAR RELATÓRIO DE CATEGORIAS (CSV E PDF)"""
@app.get("/relatorios/categorias", dependencies=[PERMISSAO_TECNICO])
async def relatorio_categorias(formato: str = "csv", usuario_logado: dict = Depends(obter_usuario_atual)):
    resultado = await categoria_repositorio.listar_categorias()
    categorias = resultado.get("categorias", [])
    if formato.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';') 
        writer.writerow(["ID", "Nome", "Descricao"])
        for c in categorias:
            writer.writerow([c.get("id", ""), c.get("nome", ""), c.get("descricao", "")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=relatorio_categorias.csv"})
    elif formato.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, txt="Relatorio de Categorias", ln=True, align='C')
        for c in categorias:
            pdf.cell(0, 10, f"ID: {c.get('id')} | Nome: {c.get('nome')} | Desc: {str(c.get('descricao'))[:40]}", 1, 1)
        return Response(content=pdf.output(dest='S').encode('latin1'), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=categorias.pdf"})
    raise HTTPException(status_code=400, detail="Formato invalido")

#===============================================================================================
#                               CRUD - HISTÓRICO
#===============================================================================================

"""READ (listar)"""
@app.get("/listar_historico")
async def listar_historico(id_equipamento: int = None, usuario_logado: dict = Depends(obter_usuario_atual)):
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
        sql = "SELECT id, nome, email, senha, tipo_usuario FROM usuario WHERE email = %s AND ativo = True"
        cur.execute(sql, (form_data.username,))
        usuario_db = cur.fetchone()

        if not usuario_db or not verificar_senha(form_data.password, usuario_db['senha']):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")

        # Mapeamento de perfis para o frontend
        perfil_map = {
            "ADMINISTRADOR": "admin",
            "TECNICO": "tecnico",
            "COMUM": "comum"
        }
        
        perfil_frontend = perfil_map.get(usuario_db['tipo_usuario'], "comum")

        # Cria o token JWT
        token_acesso = criar_token_acesso(dados={
            "sub": usuario_db['email'], 
            "id": usuario_db['id'],
            "nome": usuario_db['nome'],
            "perfil": usuario_db['tipo_usuario']
        })
        
        #dados do usuário que serão retornados para o frontend
        return {
            "access_token": token_acesso,
            "token_type": "bearer",
            "id": usuario_db['id'],
            "nome": usuario_db['nome'],
            "email": usuario_db['email'],
            "perfil": perfil_frontend,
            "tipo_usuario": usuario_db['tipo_usuario']
        }
    finally:
        if cur:
            cur.close()
        if con:
            con.close()

@app.get("/listar_logs", dependencies=[PERMISSAO_ADMIN])
async def listar_logs(tabela: str = None, id_usuario: int = None):
    """Endpoint para listar os logs de auditoria"""
    return await auditoria_repositorio.listar_logs(tabela, id_usuario)

@app.get("/dashboard/estatisticas", dependencies=[PERMISSAO_TECNICO])
async def obter_estatisticas_dashboard(usuario_logado: dict = Depends(obter_usuario_atual)):
    """Endpoint para obter dados agrupados para o dashboard principal."""
    return await dashboard_service.obter_estatisticas()