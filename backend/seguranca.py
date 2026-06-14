import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import os


SECRET_KEY = os.getenv("SECRET_KEY", "chavesecretagipar")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Configuração para hash de senhas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def obter_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)

def criar_token_acesso(dados: dict):
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token