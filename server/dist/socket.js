import { PrismaClient } from "@prisma/client";
import { producer, consumer } from "./config/kafka.js"; // Import Kafka producer and consumer
const prisma = new PrismaClient();
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
        socket.on("message", async (data) => {
            console.log("Message received:", data);
            await prisma.chats.create({ data });
            // 🔥 Send message to Kafka instead of broadcasting directly
            await producer.send({
                topic: "chat-messages",
                messages: [{ value: JSON.stringify(data) }],
            });
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
    // 🔥 Kafka Consumer: Listen for messages and broadcast to clients
    (async () => {
        await consumer.subscribe({ topic: "chat-messages", fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ message }) => {
                const chatMessage = JSON.parse(message.value.toString());
                io.to(chatMessage.room).emit("message", chatMessage);
            },
        });
    })();
}
