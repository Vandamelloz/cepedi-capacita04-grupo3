from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field
from enum import Enum

class TipoUsuario(str, Enum):
    ADMINISTRADOR = "ADMINISTRADOR"
    TECNICO = "TECNICO"
    COMUM = "COMUM"

class StatusEquipamento(str, Enum):
    DISPONIVEL = "DISPONIVEL"
    EM_USO = "EM_USO"
    RESERVADO = "RESERVADO"
    EM_MANUTENCAO = "EM_MANUTENCAO"
    INATIVO = "INATIVO"

class StatusManutencao(str, Enum):
    PENDENTE = "PENDENTE"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"

class StatusReserva(str, Enum):
    PENDENTE = "PENDENTE"
    EFETIVADA = "EFETIVADA"
    CANCELADA = "CANCELADA"

class StatusEmprestimo(str, Enum):
    ATIVO = "ATIVO"
    DEVOLVIDO = "DEVOLVIDO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"


# ================================================================
# MODELOS
# ================================================================

class EmprestimoUpdate(BaseModel):
    data_previsao_devolucao: Optional[datetime] = None
    observacoes: Optional[str] = None
    status: Optional[StatusEmprestimo] = None
    id_tecnico_retorno: Optional[int] = None

class ManutencaoUpdate(BaseModel):
    id_equipamento: Optional[int] = None
    tipo: Optional[str] = None 
    descricao_defeito: Optional[str] = None
    status: Optional[StatusManutencao] = None
    data_conclusao: Optional[datetime] = None

class Categoria(BaseModel):
    nome: str
    descricao: Optional[str] = None


class Usuario(BaseModel):
    nome: str
    email: str
    senha: str
    tipo_usuario: TipoUsuario = TipoUsuario.COMUM
    ativo: Optional[bool] = True


class Equipamento(BaseModel):
    codigo_patrimonio: str
    nome: str
    modelo: Optional[str] = None
    id_categoria: int
    quantidade: int = Field(default=1, ge=1)
    status: StatusEquipamento = StatusEquipamento.DISPONIVEL
    ativo: Optional[bool] = True


class Manutencao(BaseModel):
    id: Optional[int] = None
    id_equipamento: int
    tipo: str 
    descricao_defeito: str
    data_abertura: Optional[str] = None
    status: StatusManutencao = StatusManutencao.PENDENTE
    data_conclusao: Optional[datetime] = None

class Reserva(BaseModel):
    id_equipamento: int
    id_usuario: int
    data_reserva: date
    status: StatusReserva = StatusReserva.PENDENTE


class Emprestimo(BaseModel):
    id_usuario: int
    id_equipamento: int
    id_tecnico_saida: int
    id_tecnico_retorno: Optional[int] = None
    data_retirada: Optional[datetime] = None
    data_previsao_devolucao: datetime
    data_devolucao_real: Optional[datetime] = None
    observacoes: Optional[str] = None
    status: StatusEmprestimo = StatusEmprestimo.ATIVO

class LogAuditoria(BaseModel):
    id: Optional[int] = None
    id_usuario: Optional[int] = None
    acao: str
    tabela_afetada: str
    id_registro_afetado: Optional[int] = None
    detalhes: Optional[str] = None
    data_acao: Optional[datetime] = None

    class Config:
        from_attributes = True

class HistoricoMovimentacao(BaseModel):
    id: Optional[int] = None
    id_equipamento: int
    id_usuario_acao: int
    status_anterior: Optional[StatusEquipamento] = None
    status_novo: Optional[StatusEquipamento] = None
    descricao_motivo: str
    data_movimentacao: Optional[datetime] = None

    class Config:
        from_attributes = True