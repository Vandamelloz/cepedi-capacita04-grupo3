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
        con = None
        cur = None
        try:
            con = pymysql.connect(**self.config_db)
            cur = con.cursor()

            # Query única e otimizada para buscar todas as estatísticas de uma vez.
            # Isso reduz o número de viagens ao banco de dados, melhorando a performance.
            sql = """
            SELECT
                (SELECT COUNT(*) FROM equipamento) AS total_equip,
                (SELECT COUNT(*) FROM equipamento WHERE ativo = False) AS inativos,
                (SELECT COUNT(*) FROM equipamento WHERE status = 'DISPONIVEL') AS disponiveis,
                (SELECT COUNT(*) FROM equipamento WHERE status = 'EM_USO') AS emprestados,
                (SELECT COUNT(*) FROM equipamento WHERE status = 'EM_MANUTENCAO') AS em_manutencao,
                (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATIVO') AS emprestimos_ativos,
                (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATRASADO') AS emprestimos_atrasados,
                (SELECT COUNT(*) FROM emprestimo WHERE status = 'DEVOLVIDO') AS emprestimos_concluidos;
            """
            cur.execute(sql)
            stats = cur.fetchone()

            # Consultas agrupadas para os blocos do dashboard.
            sql_top_equipamentos = """
                SELECT
                    eq.id AS id_equipamento,
                    eq.nome AS label,
                    COUNT(emp.id) AS total
                FROM emprestimo emp
                INNER JOIN equipamento eq ON eq.id = emp.id_equipamento
                GROUP BY eq.id, eq.nome
                ORDER BY total DESC, label ASC
                LIMIT 5
            """
            cur.execute(sql_top_equipamentos)
            itens_mais_usados = cur.fetchall()

            sql_emprestimos_por_status = """
                SELECT
                    status,
                    COUNT(*) AS total
                FROM emprestimo
                GROUP BY status
                ORDER BY total DESC, status ASC
            """
            cur.execute(sql_emprestimos_por_status)
            emprestimos_por_status = cur.fetchall()

            sql_manutencoes_por_status = """
                SELECT
                    status,
                    COUNT(*) AS total
                FROM manutencao
                WHERE ativo = TRUE
                GROUP BY status
                ORDER BY total DESC, status ASC
            """
            cur.execute(sql_manutencoes_por_status)
            manutencoes_por_status = cur.fetchall()

            sql_emprestimos_por_dia = """
                SELECT
                    DATE(data_retirada) AS dia,
                    COUNT(*) AS total
                FROM emprestimo
                GROUP BY DATE(data_retirada)
                ORDER BY dia ASC
            """
            cur.execute(sql_emprestimos_por_dia)
            emprestimos_por_dia = cur.fetchall()

            sql_ultimos_emprestimos = """
                SELECT
                    emp.id,
                    emp.id_equipamento,
                    emp.id_usuario,
                    emp.data_retirada,
                    emp.data_previsao_devolucao,
                    emp.data_devolucao_real,
                    emp.status,
                    eq.nome AS equipamento,
                    u.nome AS usuario
                FROM emprestimo emp
                INNER JOIN equipamento eq ON eq.id = emp.id_equipamento
                INNER JOIN usuario u ON u.id = emp.id_usuario
                ORDER BY emp.data_retirada DESC
                LIMIT 5
            """
            cur.execute(sql_ultimos_emprestimos)
            ultimos_emprestimos = cur.fetchall()

            sql_manutencoes_em_aberto = """
                SELECT
                    m.id,
                    m.id_equipamento,
                    m.descricao_defeito,
                    m.status,
                    m.data_abertura,
                    eq.nome AS equipamento
                FROM manutencao m
                INNER JOIN equipamento eq ON eq.id = m.id_equipamento
                WHERE m.ativo = TRUE AND m.status IN ('PENDENTE', 'EM_ANDAMENTO')
                ORDER BY m.data_abertura DESC
                LIMIT 5
            """
            cur.execute(sql_manutencoes_em_aberto)
            manutencoes_em_aberto = cur.fetchall()

            total_equip = stats.get('total_equip', 0)
            disponiveis = stats.get('disponiveis', 0)
            emprestados = stats.get('emprestados', 0)
            em_manutencao = stats.get('em_manutencao', 0)
            inativos = stats.get('inativos', 0)

            # Monta o objeto de resposta final
            return {
                "sucesso": True,
                "dados": {
                    "equipamentos": {
                        "total": total_equip,
                        "disponiveis": disponiveis,
                        "emprestados": emprestados,
                        "em_manutencao": em_manutencao,
                        "inativos": inativos
                    },
                    "emprestimos": {
                        "ativos": stats.get('emprestimos_ativos', 0),
                        "atrasados": stats.get('emprestimos_atrasados', 0),
                        "concluidos": stats.get('emprestimos_concluidos', 0)
                    },
                    "manutencoes": {
                        "em_aberto": em_manutencao
                    },
                    "graficos": {
                        "itens_mais_usados": itens_mais_usados,
                        "emprestimos_por_status": emprestimos_por_status,
                        "manutencoes_por_status": manutencoes_por_status,
                        "emprestimos_por_dia": emprestimos_por_dia
                    },
                    "recentes": {
                        "ultimos_emprestimos": ultimos_emprestimos,
                        "manutencoes_em_aberto": manutencoes_em_aberto
                    }
                }
            }

        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas do dashboard: {e}")
        finally:
            if cur:
                cur.close()
            if con:
                con.close()