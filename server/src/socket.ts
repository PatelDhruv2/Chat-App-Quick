import { Server } from "socket.io";
import { Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { producer, consumer } from "./config/kafka.js"; // Import Kafka producer and consumer

const prisma = new PrismaClient();

interface CustomSocket extends Socket {
    room?: string;
}

export function setupSocket(io: Server) {
    io.use((socket: CustomSocket, next) => {
        const room = socket.handshake.auth.room || socket.handshake.headers.room;
        if (!room) return next(new Error("Room is required"));
        socket.room = room;
        next();
    });

    io.on("connection", (socket: CustomSocket) => {
        socket.join(socket.room);

        console.log(`✅ User connected: ${socket.id} in room ${socket.room}`);

        socket.on("message", async (data) => {
            console.log("📨 New message received:", data);

            try {
                // 🔥 Save to DB & send to Kafka
                await prisma.chats.create({ data });

                await producer.send({
                    topic: "chat-messages",
                    messages: [{ value: JSON.stringify(data) }],
                });

                console.log("✅ Message sent to Kafka");
            } catch (err) {
                console.error("❌ Error processing message:", err);
                socket.emit("error", "Message could not be processed");
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });

    // 🔥 Kafka Consumer: Listen for messages & broadcast to clients
    startKafkaConsumer(io);
}

async function startKafkaConsumer(io: Server) {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });

        console.log("✅ Kafka Consumer connected and subscribed to topic");

        await consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;
                const chatMessage = JSON.parse(message.value.toString());

                console.log("📨 Broadcasting message from Kafka:", chatMessage);
                io.to(chatMessage.room).emit("message", chatMessage);
            },
        });
    } catch (err) {
        console.error("❌ Kafka Consumer error:", err);
    }
}
