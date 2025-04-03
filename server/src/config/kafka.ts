import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
    clientId: "chat-app",
    brokers: ["localhost:9092"], // Update with your broker address
    logLevel: logLevel.ERROR, // Reduce noise in logs
    retry: {
        retries: 5, // Retry up to 5 times on failure
        initialRetryTime: 300, // Wait 300ms before retrying
    },
});

export const producer = kafka.producer({
    allowAutoTopicCreation: true, // Ensure topics are created if missing
});

export const consumer = kafka.consumer({
    groupId: "chat-group",
    sessionTimeout: 30000, // Increase timeout to avoid frequent rebalances
    heartbeatInterval: 5000, // Send heartbeats every 5s to prevent disconnects
});

/**
 * 🚀 Connect to Kafka with retry logic
 */
export async function connectKafka() {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            await producer.connect();
            await consumer.connect();
            console.log("✅ Connected to Kafka");
            return;
        } catch (error) {
            attempts++;
            console.error(`❌ Kafka connection failed (Attempt ${attempts}/${maxAttempts}):`, error);

            if (attempts === maxAttempts) {
                console.error("🚨 Max retries reached. Exiting...");
                process.exit(1);
            }

            await new Promise((resolve) => setTimeout(resolve, attempts * 2000)); // Exponential backoff
        }
    }
}

/**
 * 🔥 Ensure Kafka Producer sends messages in batch mode
 */
export async function sendMessage(topic: string, messages: any[]) {
    try {
        await producer.sendBatch({
            topicMessages: [
                {
                    topic,
                    messages: messages.map((msg) => ({ value: JSON.stringify(msg) })),
                },
            ],
        });
        console.log(`✅ Sent ${messages.length} messages to Kafka topic: ${topic}`);
    } catch (error) {
        console.error("❌ Error sending messages to Kafka:", error);
    }
}
