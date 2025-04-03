import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    errorFormat: 'minimal'
});
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};
connectDB();
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
export default prisma;
