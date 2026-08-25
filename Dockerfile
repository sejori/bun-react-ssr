# Runtime dependencies only — devDependencies (types, test tooling) never
# reach the final image.
FROM oven/bun:alpine AS deps

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile --production

# Full install, so the client bundle can be built.
FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:alpine AS runtime

WORKDIR /app

ENV ENV=prod
ENV PORT=8080

# --chown, because COPY preserves host file modes and the server runs unprivileged
COPY --chown=bun:bun --from=deps /app/node_modules ./node_modules
COPY --chown=bun:bun --from=build /app/dist ./dist
COPY --chown=bun:bun package.json ./
COPY --chown=bun:bun src ./src

USER bun

EXPOSE 8080

CMD ["bun", "run", "src/main.ts"]
