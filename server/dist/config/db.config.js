import { PrismaClient } from '@prisma/client';
const isBenchmarkMode = process.env.CHATAPP_BENCHMARK === '1' ||
    process.env.CHATAPP_BENCHMARK === 'true';
const globalState = globalThis;
const benchmarkStore = globalState.__chatappBenchmarkStore ?? {
    users: [],
    chatGroups: [],
    groupUsers: [],
    chats: [],
    nextUserId: 1,
    nextGroupUserId: 1,
};
globalState.__chatappBenchmarkStore = benchmarkStore;
const createBenchmarkPrisma = () => ({
    user: {
        findUnique: async ({ where }) => benchmarkStore.users.find((user) => user.email === where.email) ?? null,
        create: async ({ data }) => {
            const user = {
                id: benchmarkStore.nextUserId++,
                created_at: new Date(),
                oauth_id: null,
                image: null,
                ...data,
            };
            benchmarkStore.users.push(user);
            return user;
        },
    },
    chatGroup: {
        findMany: async ({ where }) => benchmarkStore.chatGroups.filter((group) => group.user_id === where.user_id),
        findUnique: async ({ where }) => benchmarkStore.chatGroups.find((group) => group.id === where.id) ?? null,
        create: async ({ data, }) => {
            const group = {
                id: crypto.randomUUID(),
                created_at: new Date(),
                ...data,
            };
            benchmarkStore.chatGroups.push(group);
            return group;
        },
        update: async ({ where, data, }) => {
            const group = benchmarkStore.chatGroups.find((item) => item.id === where.id);
            if (!group) {
                throw new Error('ChatGroup not found');
            }
            Object.assign(group, data);
            return group;
        },
        delete: async ({ where }) => {
            const index = benchmarkStore.chatGroups.findIndex((group) => group.id === where.id);
            if (index === -1) {
                throw new Error('ChatGroup not found');
            }
            const [removed] = benchmarkStore.chatGroups.splice(index, 1);
            return removed;
        },
    },
    groupUsers: {
        findMany: async ({ where }) => benchmarkStore.groupUsers.filter((user) => user.group_id === where.group_id),
        create: async ({ data }) => {
            const groupUser = {
                id: benchmarkStore.nextGroupUserId++,
                created_at: new Date(),
                ...data,
            };
            benchmarkStore.groupUsers.push(groupUser);
            return groupUser;
        },
    },
    chats: {
        findMany: async ({ where }) => benchmarkStore.chats.filter((chat) => chat.group_id === where.group_id),
        create: async ({ data, }) => {
            const chat = {
                id: crypto.randomUUID(),
                created_at: new Date(),
                file: null,
                message: null,
                ...data,
            };
            benchmarkStore.chats.push(chat);
            return chat;
        },
    },
    $connect: async () => undefined,
    $disconnect: async () => undefined,
});
const prisma = isBenchmarkMode
    ? createBenchmarkPrisma()
    : new PrismaClient({
        log: ['error', 'warn'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        errorFormat: 'minimal',
    });
if (!isBenchmarkMode) {
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
}
export default prisma;
