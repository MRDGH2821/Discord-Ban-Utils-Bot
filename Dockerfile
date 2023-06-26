# Builder
FROM node:lts-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

RUN apk update && apk add bash=~5 curl=~8 npm=~9 --no-cache

COPY . .

RUN npm ci

RUN npm run build && cp -r dist /app/build

# Minimalistic image
FROM node:lts-slim
WORKDIR /app
ENV NODE_ENV=production

COPY ./firebase-service-acc ./firebase-service-acc
COPY package*.json ./

COPY --from=builder /app/build .

RUN npm ci --omit=dev

RUN useradd bu-bot

USER bu-bot

HEALTHCHECK NONE

ENTRYPOINT [ "npm", "start" ]
