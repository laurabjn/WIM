FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages

RUN npm ci

COPY . .

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["npm", "run", "start:dev"]
