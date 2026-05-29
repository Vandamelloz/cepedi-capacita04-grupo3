from datetime import datetime
from pydantic import BaseModel

class Categoria(BaseModel):
    
    nome: str
    descricao: str

class Usuario(BaseModel):
    nome: str
    email: str
    senha: str #Armazenará o hash da senha (segurança)

class Equipamento(BaseModel):
    codigo_patrimonio: str
    nome: str
    modelo: str
    id_categoria: int

class Manutencao(BaseModel):
    id_equipamento: int
    descricao_defeito: str
    data_conclusao: str
