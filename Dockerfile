FROM oven/bun:latest

WORKDIR /app

ENV ENV=prod
ENV PORT=8080

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

EXPOSE 8080

CMD ["bun", "run", "src/server/main.ts"]