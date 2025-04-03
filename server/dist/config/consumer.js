import { consumer } from "./kafka.js"; // Import Kafka consumer
const startConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "chat-messages", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const chatMessage = JSON.parse(message.value?.toString() || "{}");
            console.log("Received from Kafka:", chatMessage);
            // Handle the message (store in DB, notify users, etc.)
        },
    });
};
startConsumer().catch(console.error);
