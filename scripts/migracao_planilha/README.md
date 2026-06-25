# Migração de Planilha de Equipamentos

Este script importa um arquivo de planilha de equipamentos para o banco MySQL usado pelo backend.

## Localização
- Script: `scripts/migracao_planilha/import_equipamentos.py`
- Dependências: `scripts/migracao_planilha/requirements.txt`
- Planilha de exemplo: `scripts/migracao_planilha/planilha_equipamentos.csv`
- Log: `scripts/migracao_planilha/import_equipamentos.log`

## Requisitos
Instale as dependências antes de rodar:

```bash
pip install -r scripts/migracao_planilha/requirements.txt
```

> Se você estiver usando o ambiente virtual do backend, ative-o primeiro:
>
> ```bash
> source backend/venv/bin/activate
> ```

## Como usar

Importação normal:
```bash
python scripts/migracao_planilha/import_equipamentos.py scripts/migracao_planilha/planilha_equipamentos.csv
```

Importação com inferência automática de categoria:
```bash
python scripts/migracao_planilha/import_equipamentos.py scripts/migracao_planilha/planilha_equipamentos.csv --infer-category
```

Importação com categoria padrão customizada:
```bash
python scripts/migracao_planilha/import_equipamentos.py scripts/migracao_planilha/planilha_equipamentos.csv --infer-category --default-category "Sem Categoria"
```

## O que o script faz

- lê CSV ou XLSX
- normaliza as colunas com nomes comuns
- converte a coluna de quantidade para inteiro
- insere equipamentos na tabela `equipamento`
- atualiza registros existentes com o mesmo `codigo_patrimonio`
- registra operações em `scripts/migracao_planilha/import_equipamentos.log`

## Verificando se deu certo

1. Execute o script:
   ```bash
   python scripts/migracao_planilha/import_equipamentos.py scripts/migracao_planilha/planilha_equipamentos.csv
   ```
2. Abra o log:
   ```bash
   cat scripts/migracao_planilha/import_equipamentos.log
   ```
3. Verifique o banco de dados MySQL para confirmar as inserções, por exemplo:
   ```bash
   mysql -u <usuario> -p gipar_db -e "SELECT codigo_patrimonio, nome, quantidade FROM equipamento LIMIT 20;"
   ```

## Nota
O script espera encontrar as variáveis de conexão em `backend/.env`.
