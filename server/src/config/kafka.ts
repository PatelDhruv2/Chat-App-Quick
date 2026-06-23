import { Kafka, logLevel } from "kafkajs";

const isBenchmarkMode =
    process.env.CHATAPP_BENCHMARK === "1" ||
    process.env.CHATAPP_BENCHMARK === "true";

const kafkaBrokers = (process.env.KAFKA_BROKERS ?? process.env.KAFKA_BROKER ?? "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const useAuth =
    process.env.KAFKA_USE_AUTH === "true" ||
    (!kafkaBrokers.some((broker) => broker.includes("localhost") || broker.includes("127.0.0.1")) &&
        Boolean(kafkaUsername && kafkaPassword));

const fakeAsync = async () => undefined;

const fakeProducer = {
    connect: fakeAsync,
    send: fakeAsync,
    sendBatch: fakeAsync,
};

const fakeConsumer = {
    connect: fakeAsync,
    subscribe: fakeAsync,
    run: async () => undefined,
};

export const kafka = isBenchmarkMode
    ? ({} as Kafka)
    : new Kafka({
          clientId: "chat-app",
          brokers: kafkaBrokers, // Update with your broker address
          logLevel: logLevel.ERROR, // Reduce noise in logs
          ...(useAuth
              ? {
                    ssl: true,
                    sasl: {
                        mechanism: "plain",
                        username: kafkaUsername,
                        password: kafkaPassword,
                    },
                }
              : {}),
          retry: {
              retries: 5, // Retry up to 5 times on failure
              initialRetryTime: 300, // Wait 300ms before retrying
          },
      });

export const producer = isBenchmarkMode
    ? (fakeProducer as unknown as ReturnType<Kafka["producer"]>)
    : kafka.producer({
          allowAutoTopicCreation: true, // Ensure topics are created if missing
      });

export const consumer = isBenchmarkMode
    ? (fakeConsumer as unknown as ReturnType<Kafka["consumer"]>)
    : kafka.consumer({
          groupId: "chat-group",
          sessionTimeout: 30000, // Increase timeout to avoid frequent rebalances
          heartbeatInterval: 5000, // Send heartbeats every 5s to prevent disconnects
      });

/**
 * 🚀 Connect to Kafka with retry logic
 */
export async function connectKafka() {
    if (isBenchmarkMode) {
        return;
    }

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
    if (isBenchmarkMode) {
        return;
    }

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
