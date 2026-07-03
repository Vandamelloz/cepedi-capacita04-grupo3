import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
import os

load_dotenv()

config_db = {
    "host": os.getenv("host"),
    "user": os.getenv("user"),
    "password": os.getenv("password"),
    "database": os.getenv("database"),
    "cursorclass": DictCursor
}

try:
    con = pymysql.connect(**config_db)
    cur = con.cursor()
    cur.execute("SHOW TABLES")
    tabelas = [list(t.values())[0] for t in cur.fetchall()]
    print("📋 Tabelas encontradas no banco:")
    for tabela in tabelas:
        print(f"  - {tabela}")

    if "logs_auditoria" not in tabelas:
        print("\n⚠️  ATENÇÃO: A tabela 'logs_auditoria' NÃO existe!")
    else:
        print("\n✅ Tabela 'logs_auditoria' encontrada.")

    if "historico_movimentacao" not in tabelas:
        print("⚠️  ATENÇÃO: A tabela 'historico_movimentacao' NÃO existe!")
    else:
        print("✅ Tabela 'historico_movimentacao' encontrada.")

    cur.close()
    con.close()
except Exception as e:
    print(f"Erro ao conectar: {e}")