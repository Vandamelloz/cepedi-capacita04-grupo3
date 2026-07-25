import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

#USE pip install passlib argon2-cffi

SECRET_KEY = os.getenv("SECRET_KEY", "chavesecretagipar")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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
    


def obter_usuario_atual(token: str = Depends(oauth2_scheme)):
    """
    Verifica o token da requisição. Se for válido, retorna os dados do usuário.
    Se não for, bloqueia o acesso com Erro 401.
    """
    excecao_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Reutiliza sua função existente para abrir o token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        usuario_id: int = payload.get("id")
        perfil: str = payload.get("perfil")

        if email is None or usuario_id is None:
            raise excecao_credenciais
            
        # Retorna o ID e o email extraídos do token
        return {"id": usuario_id, "email": email, "perfil": perfil}
        
    except jwt.PyJWTError:
        raise excecao_credenciais
    
def verificar_permissao(tipos_permitidos: list):
    async def dependecia_verificacao(usuario_logado: dict = Depends(obter_usuario_atual)):
        # Busca o perfil direto do token decodificado
        # Precisamos ajustar o obter_usuario_atual para extrair o 'perfil' também!
        perfil_usuario = usuario_logado.get("perfil") 
        
        if perfil_usuario not in tipos_permitidos:
            raise HTTPException(
                status_code=403, 
                detail="Você não tem permissão para realizar esta ação"
            )
        return usuario_logado
    return dependecia_verificacao