from locust import HttpUser, task, between

class UsuarioGipar(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """
        O método on_start roda uma única vez para cada usuário virtual 
        antes que ele comece a executar as tarefas (tasks).
        """
        # 1. O Locust faz o login usando um usuário válido do seu banco
        resposta_login = self.client.post(
            "/login", 
            data={"username": "admin@gipar.com", "password": "admin123"}
        )
        
        # 2. Se o login der certo, ele salva o token na sessão
        if resposta_login.status_code == 200:
            token = resposta_login.json()["access_token"]
            # Coloca o token no cabeçalho (header) de todas as futuras requisições
            self.client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print("🚨 Falha ao realizar o login no teste. Verifique o email/senha.")

    @task(1)
    def acessar_home(self):
        self.client.get("/")

    @task(2)
    def listar_equipamentos(self):
        # Agora essa requisição vai com o Token embutido e vai bater no banco de dados real!
        self.client.get("/listar_equipamentos")