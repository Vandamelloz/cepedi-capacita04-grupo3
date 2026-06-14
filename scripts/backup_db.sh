DIR_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


ENV_FILE="$DIR_SCRIPT/../backend/.env"


if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "Erro de segurança: Arquivo .env não encontrado em $ENV_FILE"
    exit 1
fi


BACKUP_DIR="$DIR_SCRIPT/../backups"
mkdir -p "$BACKUP_DIR"


DATE=$(date +"%Y-%m-%d_%H-%M")
FILE_NAME="backup_${database}_${DATE}.sql"


mysqldump -h "$host" -u "$user" -p"$password" "$database" > "$BACKUP_DIR/$FILE_NAME"

# Remove backups antigos (mais de 7 dias)
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -exec rm {} \;

echo "Backup concluído com sucesso em: $BACKUP_DIR/$FILE_NAME"