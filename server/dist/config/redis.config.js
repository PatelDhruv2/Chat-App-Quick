import { Redis } from 'ioredis';
const isBenchmarkMode = process.env.CHATAPP_BENCHMARK === '1' ||
    process.env.CHATAPP_BENCHMARK === 'true';
const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = Number(process.env.REDIS_PORT ?? '6379');
const redis = isBenchmarkMode
    ? {
        options: {},
    }
    : process.env.REDIS_HOST
        ? new Redis({
            host: redisHost,
            port: redisPort,
        })
        : null;
export default redis;
