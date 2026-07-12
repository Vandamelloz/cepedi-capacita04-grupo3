import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import os

#USE pip install passlib argon2-cffi

SECRET_KEY = os.getenv("SECRET_KEY", "chavesecretagipar")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 🔴 MUDANÇA: Trocar bcrypt por argon2 (sem limite de 72 bytes)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def obter_hash_senha(senha: str) -> str:
    """
    Gera o hash da senha usando argon2.
    Argon2 NÃO tem limite de 72 bytes - senha pode ser qualquer tamanho!
    """
    return pwd_context.hash(senha)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Verifica se a senha corresponde ao hash."""
    return pwd_context.verify(senha_plana, senha_hash)


def criar_token_acesso(dados: dict):
    """Cria um token JWT de acesso."""
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decodificar_token(token: str) -> dict:
    """Decodifica e verifica um token JWT."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return {}