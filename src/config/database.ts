import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import config from '../config';


// Prisma Client Singleton
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
    var redisClient: undefined | ReturnType<typeof createClient>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (config.nodeEnv !== 'production') {
    globalThis.prisma = prisma;
}

// Redis Client
export const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

redisClient.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

// Connect Redis
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

// Disconnect all database connections
export const disconnectDatabases = async () => {
    await prisma.$disconnect();
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
};
