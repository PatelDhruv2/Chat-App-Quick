import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

// Handling connection
prisma.$connect()
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });

// Handle disconnection
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;