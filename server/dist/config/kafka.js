import { Kafka } from 'kafkajs';
export const kafka = new Kafka({
    clientId: "chat-app",
    brokers: ["localhost:9092"], // Use your Kafka broker address
});
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "chat-group" });
export async function connectKafka() {
    await producer.connect();
    await consumer.connect();
    console.log("✅ Connected to Kafka");
}
