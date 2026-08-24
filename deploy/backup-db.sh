#!/bin/bash
# Sauvegarde PostgreSQL du VPS OVH.
# À installer en cron sur le VPS (voir deploy/README.md) :
#   0 3 * * * /opt/wim/deploy/backup-db.sh >> /var/log/wim-backup.log 2>&1
#
# Un snapshot VPS OVH ne remplace pas ce dump : il capture le disque à chaud,
# donc potentiellement un cluster Postgres dans un état non cohérent.

set -euo pipefail

PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin${PATH:+:$PATH}"
export PATH

if ! command -v docker >/dev/null 2>&1; then
  echo "[backup] ERREUR : docker introuvable dans le PATH ($PATH)" >&2
  exit 1
fi

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

if [ ! -w "$BACKUP_DIR" ]; then
  echo "[backup] ERREUR : $BACKUP_DIR n'est pas accessible en ecriture pour $(id -un)." >&2
  echo "[backup] Corrigez avec : sudo chown $(id -un) $BACKUP_DIR" >&2
  exit 1
fi

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

# --- Copie hors du VPS ------------------------------------------------------
# S'active dès que RCLONE_REMOTE est renseigné dans .env.prod (ex. ovh:wim-backups).
# Sans cette variable, le script se comporte exactement comme avant.
if [ -n "${RCLONE_REMOTE:-}" ]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "[backup] ERREUR : RCLONE_REMOTE est défini mais rclone n'est pas installé" >&2
    exit 1
  fi

  echo "[backup] Copie vers $RCLONE_REMOTE"

  # `copy` et non `sync` : `sync` répliquerait à distance toute suppression
  # locale. Un serveur compromis effacerait alors aussi les sauvegardes
  # distantes — précisément ce contre quoi elles protègent.
  rclone copy "$BACKUP_DIR" "$RCLONE_REMOTE" --stats-one-line

  # La rétention distante est plus longue que la locale : le stockage objet
  # coûte peu, et une corruption peut n'être découverte que des semaines après.
  rclone delete "$RCLONE_REMOTE" --min-age "${REMOTE_RETENTION_DAYS:-90}d"

  echo "[backup] Copie distante OK ($(rclone size "$RCLONE_REMOTE" --json 2>/dev/null | head -c 120))"
fi
