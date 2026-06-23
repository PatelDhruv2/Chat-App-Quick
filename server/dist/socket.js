import { producer, consumer } from "./config/kafka.js";
import prisma from "./config/db.config.js";
const FAST_SOCKET = process.env.CHATAPP_FAST_SOCKET !== "false";
const KAFKA_BATCH_SIZE = Number(process.env.CHATAPP_KAFKA_BATCH_SIZE ?? 200);
const KAFKA_FLUSH_MS = Number(process.env.CHATAPP_KAFKA_FLUSH_MS ?? 25);
const DB_BATCH_SIZE = Number(process.env.CHATAPP_DB_BATCH_SIZE ?? 200);
const DB_FLUSH_MS = Number(process.env.CHATAPP_DB_FLUSH_MS ?? 50);
const kafkaQueue = [];
const dbQueue = [];
let kafkaFlushTimer = null;
let dbFlushTimer = null;
let kafkaFlushPromise = null;
let dbFlushPromise = null;
function normalizeMessage(data, room) {
    return {
        id: data.id ?? crypto.randomUUID(),
        group_id: data.group_id,
        room,
        message: data.message ?? null,
        name: data.name,
        file: data.file ?? null,
        created_at: data.created_at ?? new Date().toISOString(),
    };
}
async function flushKafkaQueue() {
    if (kafkaFlushPromise)
        return kafkaFlushPromise;
    kafkaFlushPromise = (async () => {
        const batch = kafkaQueue.splice(0, kafkaQueue.length);
        if (!batch.length)
            return;
        try {
            await producer.sendBatch({
                topicMessages: [
                    {
                        topic: "chat-messages",
                        messages: batch.map((msg) => ({
                            value: JSON.stringify(msg),
                        })),
                    },
                ],
            });
        }
        catch (err) {
            console.error("❌ Failed to flush Kafka queue:", err);
        }
    })().finally(() => {
        kafkaFlushPromise = null;
    });
    return kafkaFlushPromise;
}
function enqueueKafkaMessage(message) {
    kafkaQueue.push(message);
    if (kafkaQueue.length >= KAFKA_BATCH_SIZE) {
        void flushKafkaQueue();
        return;
    }
    if (!kafkaFlushTimer) {
        kafkaFlushTimer = setTimeout(() => {
            kafkaFlushTimer = null;
            void flushKafkaQueue();
        }, KAFKA_FLUSH_MS);
    }
}
async function flushDbQueue() {
    if (dbFlushPromise)
        return dbFlushPromise;
    dbFlushPromise = (async () => {
        const batch = dbQueue.splice(0, dbQueue.length);
        if (!batch.length)
            return;
        try {
            await prisma.chats.createMany({
                data: batch.map((msg) => ({
                    id: msg.id,
                    group_id: msg.group_id,
                    message: msg.message,
                    name: msg.name,
                    file: msg.file,
                })),
            });
        }
        catch (err) {
            console.error("❌ Failed to flush chat DB queue:", err);
        }
    })().finally(() => {
        dbFlushPromise = null;
    });
    return dbFlushPromise;
}
function enqueueDbMessage(message) {
    dbQueue.push(message);
    if (dbQueue.length >= DB_BATCH_SIZE) {
        void flushDbQueue();
        return;
    }
    if (!dbFlushTimer) {
        dbFlushTimer = setTimeout(() => {
            dbFlushTimer = null;
            void flushDbQueue();
        }, DB_FLUSH_MS);
    }
}
export function setupSocket(io) {
    io.use((socket, next) => {
        const room = socket.handshake.auth.room || socket.handshake.headers.room;
        if (!room)
            return next(new Error("Room is required"));
        socket.room = room;
        next();
    });
    io.on("connection", (socket) => {
        socket.join(socket.room);
        console.log(`✅ User connected: ${socket.id} in room ${socket.room}`);
        socket.on("message", async (data) => {
            try {
                const room = data.room ?? socket.room ?? data.group_id;
                if (!room) {
                    socket.emit("error", "Room is required");
                    return;
                }
                const eventPayload = normalizeMessage(data, room);
                io.to(room).emit("message", eventPayload);
                if (FAST_SOCKET) {
                    enqueueKafkaMessage(eventPayload);
                    return;
                }
                await prisma.chats.create({
                    data: {
                        id: eventPayload.id,
                        group_id: eventPayload.group_id,
                        message: eventPayload.message,
                        name: eventPayload.name,
                        file: eventPayload.file,
                    },
                });
                await producer.send({
                    topic: "chat-messages",
                    messages: [{ value: JSON.stringify(eventPayload) }],
                });
            }
            catch (err) {
                console.error("❌ Error processing message:", err);
                socket.emit("error", "Message could not be processed");
            }
        });
        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
    if (FAST_SOCKET) {
        startKafkaConsumer();
    }
}
async function startKafkaConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });
        console.log("✅ Kafka Consumer connected and subscribed to topic");
        await consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value)
                    return;
                const chatMessage = JSON.parse(message.value.toString());
                enqueueDbMessage(chatMessage);
            },
        });
    }
    catch (err) {
        console.error("❌ Kafka Consumer error:", err);
    }
}
