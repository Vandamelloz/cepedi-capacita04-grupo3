from fastapi.testclient import TestClient
from main import app  # Importa a sua instância FastAPI

client = TestClient(app)

def test_read_main_deve_retornar_200():
    # Simulando uma requisição GET para a raiz da API
    response = client.get("/")
    
    # 1. Verifica se o status HTTP está correto
    assert response.status_code == 200
    
    # 2. Verifica se o corpo da resposta contém o que esperamos
    dados = response.json()
    assert dados["mensagem"] == "Bem-vindo à API do GIPAR!"
    assert dados["versao"] == "2.0"
    assert "endpoints" in dados