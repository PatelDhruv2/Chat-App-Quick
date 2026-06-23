# Express Js With Typescript Starter Kit

## Local services

Use Docker to start Redis and Kafka only:

```sh
docker compose up -d
```

The compose file starts:
- Redis on `localhost:6379`
- Kafka on `localhost:9092`

Prisma keeps using the existing `DATABASE_URL` from your current `.env`.

## Local env

Do not replace your Prisma `.env` if it already points at the real database.
Only add the local service values if you need them:

```sh
copy .env.docker.example .env.local
```

## Run the server

```sh
npm run dev
```

## Real benchmark

With the server running, launch the live benchmark from the frontend package:

```sh
cd ..\frontend
npm run benchmark:local
```
