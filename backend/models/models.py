from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

class Categoria(BaseModel):
    nome: str
    descricao: Optional[str] = None

class Usuario(BaseModel):
    nome: str
    email: str
    senha: str 
    ativo: Optional[bool] = True

class Equipamento(BaseModel):
    codigo_patrimonio: str
    nome: str
    modelo: Optional[str] = None
    id_categoria: int
    quantidade: int = Field(default=1, ge=1)
    ativo: Optional[bool] = True

class Manutencao(BaseModel):
    id_equipamento: int
    descricao_defeito: str
    data_conclusao: Optional[datetime] = None

class Reserva(BaseModel):
    id_equipamento: int
    id_usuario: int
    data_reserva: date

class Emprestimo(BaseModel):
    id_equipamento: int
    id_usuario: int
    id_tecnico_saida: int
    id_tecnico_retorno: Optional[int] = None
    data_previsao_devolucao: datetime
    data_devolucao_real: Optional[datetime] = None
    observacoes: Optional[str] = None

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
