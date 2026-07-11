### Deps
FROM node:24.18.0-alpine3.23 AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

### Builder
FROM deps AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY --exclude=node_modules/ . .
COPY --from=deps /app ./

RUN npm run generate:api-client
RUN npm run build

### Builder
FROM nginx:1.29.6-alpine3.23 AS runner

WORKDIR /usr/share/nginx/html

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist .

