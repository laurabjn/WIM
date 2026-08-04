#!/bin/sh
# Entrypoint de production : applique les migrations puis démarre l'API compilée.
# `set -e` garantit qu'une migration échouée empêche le démarrage plutôt que de
# faire tourner l'API sur un schéma incohérent.
set -e

echo "[entrypoint] Application des migrations Prisma..."
# `migrate deploy` n'applique que les migrations déjà versionnées : contrairement
# à `migrate dev`, il ne génère rien et ne réinitialise jamais la base.
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "[entrypoint] Démarrage de l'API sur le port ${PORT:-3000}..."
exec node dist/apps/api/src/main.js
