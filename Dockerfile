# Builder
FROM node:lts-alpine AS builder
WORKDIR /app

RUN apk update && apk add bash=~5 curl=~8 npm=~10 git=~2 --no-cache

COPY . .

RUN npm install && npm run build

# Minimalistic image
FROM node:lts-slim
WORKDIR /app
ENV NODE_ENV=production

COPY ./firebase-service-acc ./firebase-service-acc
COPY package*.json ./
COPY .husky/install.mjs /app/.husky/install.mjs

COPY --from=builder /app/dist ./dist

RUN npm install --omit=dev && useradd bu-bot

USER bu-bot

LABEL org.opencontainers.image.authors="MRDGH2821 <https://github.com/MRDGH2821>"
LABEL org.opencontainers.image.url=https://github.com/MRDGH2821/Discord-Ban-Utils-Bot
LABEL org.opencontainers.image.documentation=https://github.com/MRDGH2821/Discord-Ban-Utils-Bot#readme
LABEL org.opencontainers.image.source=https://github.com/MRDGH2821/Discord-Ban-Utils-Bot
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.title="Ban Utils Discord Bot"
LABEL org.opencontainers.image.description="Discord Ban Utilities for Mutual Servers!"
LABEL org.opencontainers.image.base.name=docker.io/library/node:lts-slim

HEALTHCHECK CMD curl -k -f http://localhost:9000 || exit 1

ENTRYPOINT [ "node", "./dist/index.js" ]
