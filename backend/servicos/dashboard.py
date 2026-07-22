import pymysql
from pymysql.cursors import DictCursor
from fastapi import HTTPException
import traceback

class DashboardService:
    def __init__(self, db_config: dict):
        self.config_db = db_config
        self.config_db["cursorclass"] = DictCursor

    async def obter_estatisticas(self):
        """
        Busca e agrupa dados de várias tabelas para popular o dashboard.
        """
        try:
            with pymysql.connect(**self.config_db) as con, con.cursor() as cur:
                # Query 1: Contadores principais para as métricas
                sql_stats = """
                    SELECT
                        (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATIVO') AS emprestimos_ativos,
                        (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATRASADO') AS emprestimos_atrasados,
                        (SELECT COUNT(*) FROM equipamento WHERE status = 'EM_MANUTENCAO') AS em_manutencao;
                """
                cur.execute(sql_stats)
                stats = cur.fetchone()

                # Query 2: Lista completa de empréstimos para a tabela principal
                sql_emprestimos = """
                    SELECT
                        emp.id,
                        eq.nome AS equipamento,
                        eq.codigo_patrimonio AS patrimonio,
                        u.nome AS usuario,
                        emp.data_retirada AS data,
                        emp.data_previsao_devolucao AS dataDevolucao,
                        emp.data_devolucao_real AS dataDevolucaoReal,
                        emp.status,
                        emp.observacoes
                    FROM emprestimo emp
                    INNER JOIN equipamento eq ON eq.id = emp.id_equipamento
                    INNER JOIN usuario u ON u.id = emp.id_usuario
                    ORDER BY emp.data_retirada DESC
                """
                cur.execute(sql_emprestimos)
                emprestimos = cur.fetchall()

                # Query 3: Itens mais usados para o gráfico
                sql_top_equipamentos = """
                    SELECT
                        eq.nome AS label,
                        COUNT(emp.id) AS count
                    FROM emprestimo emp
                    INNER JOIN equipamento eq ON eq.id = emp.id_equipamento
                    GROUP BY eq.id, eq.nome
                    ORDER BY count DESC, label ASC
                    LIMIT 5
                """
                cur.execute(sql_top_equipamentos)
                itens_mais_usados = cur.fetchall()

                # Query 4: Nomes dos equipamentos em manutenção para o filtro
                sql_equip_manutencao = "SELECT nome FROM equipamento WHERE status = 'EM_MANUTENCAO'"
                cur.execute(sql_equip_manutencao)
                equipamentos_em_manutencao_result = cur.fetchall()
                equipamentos_em_manutencao = [item['nome'] for item in equipamentos_em_manutencao_result]

                # Query 5: Manutenções pendentes para notificações
                sql_manutencoes_pendentes = """
                    SELECT m.id, eq.nome AS equipamento
                    FROM manutencao m
                    JOIN equipamento eq ON m.id_equipamento = eq.id
                    WHERE m.status = 'PENDENTE'
                    ORDER BY m.data_abertura DESC
                """
                cur.execute(sql_manutencoes_pendentes)
                manutencoes_pendentes = cur.fetchall()

                # Query 6: Empréstimos atrasados para notificações
                sql_emprestimos_atrasados_notificacao = """
                    SELECT emp.id, eq.nome as equipamento, u.nome as usuario
                    FROM emprestimo emp
                    JOIN equipamento eq ON emp.id_equipamento = eq.id
                    JOIN usuario u ON emp.id_usuario = u.id
                    WHERE emp.status = 'ATRASADO'
                    ORDER BY emp.data_previsao_devolucao ASC
                """
                cur.execute(sql_emprestimos_atrasados_notificacao)
                emprestimos_atrasados_notificacao = cur.fetchall()

                # --- Processamento e Estruturação dos Dados ---

                # 1. Monta o array de métricas no formato esperado pelo frontend
                metricas = [
                    {"id": "ativos", "label": "Empréstimos Ativos", "count": stats.get('emprestimos_ativos', 0)},
                    {"id": "atrasados", "label": "Empréstimos Atrasados", "count": stats.get('emprestimos_atrasados', 0)},
                    {"id": "manutencao", "label": "Em Manutenção", "count": stats.get('em_manutencao', 0)},
                ]

                # 2. Monta o array de notificações no formato esperado pelo frontend
                notificacoes = []
                for emprestimo in emprestimos_atrasados_notificacao:
                    notificacoes.append({
                        "id": f"emp-atr-{emprestimo['id']}",
                        "titulo": "Empréstimo atrasado",
                        "mensagem": f"Empréstimo para {emprestimo['usuario']} do item '{emprestimo['equipamento']}' está atrasado.",
                        "horario": "Hoje",
                        "tipo": "atraso",
                        "lida": False,
                    })

                for manutencao in manutencoes_pendentes:
                    notificacoes.append({
                        "id": f"man-pen-{manutencao['id']}",
                        "titulo": "Manutenção pendente",
                        "tipo": "manutencao",
                        "mensagem": f"Nova solicitação de manutenção para o item '{manutencao['equipamento']}'.",
                        "horario": "Hoje",
                        "lida": False,
                    })

                # 3. Monta o objeto de resposta final no formato esperado pelo frontend
                return {
                    "sucesso": True,
                    "dados": {
                        "metricas": metricas,
                        "emprestimos": emprestimos,
                        "itensMaisUsados": itens_mais_usados,
                        "notificacoes": notificacoes,
                        "equipamentosEmManutencao": equipamentos_em_manutencao,
                    }
                }

        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas do dashboard: {e}")