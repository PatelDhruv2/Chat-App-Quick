import { PrismaClient } from '@prisma/client';

const isBenchmarkMode =
    process.env.CHATAPP_BENCHMARK === '1' ||
    process.env.CHATAPP_BENCHMARK === 'true';

type BenchmarkUser = {
    id: number;
    name: string;
    email: string;
    provider: string;
    oauth_id?: string | null;
    image?: string | null;
    created_at: Date;
};

type BenchmarkChatGroup = {
    id: string;
    user_id: number;
    title: string;
    passcode: string;
    created_at: Date;
};

type BenchmarkGroupUser = {
    id: number;
    group_id: string;
    name: string;
    created_at: Date;
};

type BenchmarkChat = {
    id: string;
    group_id: string;
    message?: string | null;
    name: string;
    file?: string | null;
    created_at: Date;
};

type BenchmarkStore = {
    users: BenchmarkUser[];
    chatGroups: BenchmarkChatGroup[];
    groupUsers: BenchmarkGroupUser[];
    chats: BenchmarkChat[];
    nextUserId: number;
    nextGroupUserId: number;
};

const globalState = globalThis as typeof globalThis & {
    __chatappBenchmarkStore?: BenchmarkStore;
};

const benchmarkStore: BenchmarkStore =
    globalState.__chatappBenchmarkStore ?? {
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
        findUnique: async ({ where }: { where: { email: string } }) =>
            benchmarkStore.users.find((user) => user.email === where.email) ?? null,
        create: async ({ data }: { data: Omit<BenchmarkUser, 'id' | 'created_at'> }) => {
            const user: BenchmarkUser = {
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
        findMany: async ({ where }: { where: { user_id: number } }) =>
            benchmarkStore.chatGroups.filter((group) => group.user_id === where.user_id),
        findUnique: async ({ where }: { where: { id: string } }) =>
            benchmarkStore.chatGroups.find((group) => group.id === where.id) ?? null,
        create: async ({
            data,
        }: {
            data: { title: string; passcode: string; user_id: number };
        }) => {
            const group: BenchmarkChatGroup = {
                id: crypto.randomUUID(),
                created_at: new Date(),
                ...data,
            };
            benchmarkStore.chatGroups.push(group);
            return group;
        },
        update: async ({
            where,
            data,
        }: {
            where: { id: string };
            data: Partial<BenchmarkChatGroup>;
        }) => {
            const group = benchmarkStore.chatGroups.find((item) => item.id === where.id);
            if (!group) {
                throw new Error('ChatGroup not found');
            }
            Object.assign(group, data);
            return group;
        },
        delete: async ({ where }: { where: { id: string } }) => {
            const index = benchmarkStore.chatGroups.findIndex((group) => group.id === where.id);
            if (index === -1) {
                throw new Error('ChatGroup not found');
            }
            const [removed] = benchmarkStore.chatGroups.splice(index, 1);
            return removed;
        },
    },
    groupUsers: {
        findMany: async ({ where }: { where: { group_id: string } }) =>
            benchmarkStore.groupUsers.filter((user) => user.group_id === where.group_id),
        create: async ({ data }: { data: { name: string; group_id: string } }) => {
            const groupUser: BenchmarkGroupUser = {
                id: benchmarkStore.nextGroupUserId++,
                created_at: new Date(),
                ...data,
            };
            benchmarkStore.groupUsers.push(groupUser);
            return groupUser;
        },
    },
    chats: {
        findMany: async ({ where }: { where: { group_id: string } }) =>
            benchmarkStore.chats.filter((chat) => chat.group_id === where.group_id),
        create: async ({
            data,
        }: {
            data: { group_id: string; message?: string; name: string; file?: string | null };
        }) => {
            const chat: BenchmarkChat = {
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
    ? (createBenchmarkPrisma() as unknown as PrismaClient)
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
        } catch (error) {
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
