FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
COPY apps/api/prisma apps/api/prisma

RUN npm ci

COPY . .

RUN npx prisma generate --schema=/app/apps/api/prisma/schema.prisma

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["npm", "run", "start:dev"]
