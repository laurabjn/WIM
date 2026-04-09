FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages packages
COPY . .

RUN npm ci
WORKDIR /app/apps/web
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/web
EXPOSE 3001

CMD ["npm", "run", "start", "--", "-p", "3001"]