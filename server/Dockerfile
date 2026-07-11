### Deps
FROM node:24.18.0-alpine3.23 AS deps

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci

### Runner
FROM deps AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY . .
COPY --from=deps /app ./

CMD ["npm", "start"]
