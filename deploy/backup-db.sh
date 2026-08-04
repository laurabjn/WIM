#!/bin/bash
# Sauvegarde PostgreSQL du VPS OVH.
# À installer en cron sur le VPS (voir deploy/README.md) :
#   0 3 * * * /opt/wim/deploy/backup-db.sh >> /var/log/wim-backup.log 2>&1
#
# Un snapshot VPS OVH ne remplace pas ce dump : il capture le disque à chaud,
# donc potentiellement un cluster Postgres dans un état non cohérent.

set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/wim}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/wim}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
ENV_FILE="$REPO_DIR/deploy/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "[backup] ERREUR : $ENV_FILE introuvable" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a && . "$ENV_FILE" && set +a

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
DUMP_FILE="$BACKUP_DIR/wim-$STAMP.dump"

echo "[backup] $(date -Is) — dump de la base $POSTGRES_DB"

# Format custom (-Fc) : compressé et restaurable sélectivement via pg_restore.
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" wim_db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$DUMP_FILE"

# Un dump tronqué (disque plein, conteneur tué) ne doit pas écraser l'historique
# ni passer pour une sauvegarde valide.
if [ ! -s "$DUMP_FILE" ]; then
  echo "[backup] ERREUR : dump vide, suppression" >&2
  rm -f "$DUMP_FILE"
  exit 1
fi

# Les fichiers uploadés ne sont pas dans la base : les sauvegarder aussi.
UPLOADS_FILE="$BACKUP_DIR/wim-uploads-$STAMP.tar.gz"
docker run --rm -v wim_wim_uploads:/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/$(basename "$UPLOADS_FILE")" -C /data . 2>/dev/null \
  || echo "[backup] AVERTISSEMENT : sauvegarde des uploads échouée" >&2

find "$BACKUP_DIR" -name 'wim-*' -type f -mtime +"$RETENTION_DAYS" -delete

echo "[backup] OK — $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
