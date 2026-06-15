import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Carrega as variáveis (caso o serviço seja testado isoladamente)
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def enviar_email(destinatario: str, assunto: str, corpo_html: str) -> bool:
    """
    Envia um e-mail HTML utilizando o servidor SMTP configurado.
    Retorna True se o envio for bem-sucedido, False caso contrário.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        raise ValueError("Credenciais de e-mail (SMTP_USER/SMTP_PASSWORD) não configuradas no .env")

    msg = EmailMessage()
    msg['Subject'] = assunto
    msg['From'] = SMTP_USER
    msg['To'] = destinatario
    
    # Define o conteúdo da mensagem como HTML
    msg.set_content(corpo_html, subtype='html')

    try:
        # Conexão com o servidor SMTP usando TLS (criptografia)
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail para {destinatario}: {e}")
        return False
