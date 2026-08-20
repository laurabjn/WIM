#!/bin/sh
# Entrypoint de production : applique les migrations puis démarre l'API compilée.
# `set -e` garantit qu'une migration échouée empêche le démarrage plutôt que de
# faire tourner l'API sur un schéma incohérent.
set -e

# Le volume `wim_uploads` n'est peuple par l'image que lorsqu'il est vide : sur un
# volume deja existant, un nouveau sous-dossier n'apparaitrait jamais et multer
# echouerait a l'ecriture. On les recree donc a chaque demarrage.
# Un echec ici ne doit pas priver de demarrage toute l'API : seuls les envois de
# fichiers en patiraient, alors qu'un `set -e` provoquerait une panne totale.
UPLOADS="${UPLOADS_DIR:-$(pwd)/uploads}"
mkdir -p "$UPLOADS/avatars" "$UPLOADS/homes" "$UPLOADS/messages" \
  || echo "[entrypoint] AVERTISSEMENT : dossiers d'upload non crees dans $UPLOADS"

echo "[entrypoint] Application des migrations Prisma..."
# `migrate deploy` n'applique que les migrations déjà versionnées : contrairement
# à `migrate dev`, il ne génère rien et ne réinitialise jamais la base.
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "[entrypoint] Démarrage de l'API sur le port ${PORT:-3000}..."
exec node dist/apps/api/src/main.js
