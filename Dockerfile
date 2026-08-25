# Base deps
FROM oven/bun:alpine AS deps

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile --production

# Bundle builder
FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Slim app runtime
FROM oven/bun:alpine AS runtime

WORKDIR /app

ENV ENV=prod
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY src ./src

EXPOSE 8080

CMD ["bun", "run", "src/main.ts"]
