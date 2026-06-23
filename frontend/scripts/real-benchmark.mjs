import axios from "axios";
import { io } from "socket.io-client";
import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";
import http from "node:http";
import https from "node:https";

const baseUrl = process.env.BENCHMARK_BASE_URL ?? "http://localhost:7000";
const wsUrl = process.env.BENCHMARK_WS_URL ?? baseUrl;
const loginIterations = Number(process.env.LOGIN_ITERATIONS ?? 100);
const loginConcurrency = Number(process.env.LOGIN_CONCURRENCY ?? 50);
const socketIterations = Number(process.env.SOCKET_ITERATIONS ?? 2000);
const benchmarkGroupTitle = `Benchmark Group ${randomUUID()}`;
const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 100 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100 }),
  timeout: 30000,
});

function waitForEvent(socket, eventName, predicate, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeoutMs);

    const handler = (payload) => {
      if (predicate && !predicate(payload)) {
        return;
      }

      clearTimeout(timeout);
      socket.off(eventName, handler);
      resolve(payload);
    };

    socket.on(eventName, handler);
  });
}

async function benchmarkLogin() {
  const email = `benchmark-${Date.now()}@example.com`;
  const body = {
    name: "Benchmark User",
    email,
    provider: "google",
    oauth_id: `benchmark-oauth-${Date.now()}`,
    image: null,
  };

  const firstStart = performance.now();
  const firstResponse = await client.post(`${baseUrl}/api/auth/login`, body);
  const firstElapsedMs = performance.now() - firstStart;
  const authToken = firstResponse.data?.user?.token;

  if (!authToken) {
    throw new Error("Benchmark login did not return an auth token");
  }

  const repeatedStart = performance.now();
  for (let index = 0; index < loginIterations; index += loginConcurrency) {
    const batchSize = Math.min(loginConcurrency, loginIterations - index);
    await Promise.all(
      Array.from({ length: batchSize }, () => client.post(`${baseUrl}/api/auth/login`, body)),
    );
  }
  const repeatedElapsedMs = performance.now() - repeatedStart;

  return {
    firstCallMs: firstElapsedMs,
    repeatedIterations: loginIterations,
    repeatedElapsedMs,
    repeatedAverageMs: repeatedElapsedMs / loginIterations,
    repeatedThroughputPerSecond: (loginIterations / repeatedElapsedMs) * 1000,
    authToken,
  };
}

async function createBenchmarkGroup(token) {
  await axios.post(
    `${baseUrl}/api/chat-group`,
    {
      title: benchmarkGroupTitle,
      passcode: `pass-${Date.now()}`,
    },
    {
      headers: {
        Authorization: token,
      },
    },
  );

  const { data } = await client.get(`${baseUrl}/api/chat-group`, {
    headers: {
      Authorization: token,
    },
  });

  const groups = Array.isArray(data?.data) ? data.data : [];
  const createdGroup = groups.find((group) => group.title === benchmarkGroupTitle);

  if (!createdGroup?.id) {
    throw new Error("Failed to create benchmark chat group");
  }

  return createdGroup.id;
}

async function benchmarkSocket(roomId) {
  const receiver = io(wsUrl, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { room: roomId },
  });

  await new Promise((resolve, reject) => {
    receiver.once("connect", resolve);
    receiver.once("connect_error", reject);
    receiver.connect();
  });

  const sender = io(wsUrl, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { room: roomId },
  });

  await new Promise((resolve, reject) => {
    sender.once("connect", resolve);
    sender.once("connect_error", reject);
    sender.connect();
  });

  const receivedIds = new Set();
  const expectedIds = new Set();
  const totalMessages = socketIterations;
  const sentAt = new Map();
  const latencies = [];
  let completeResolver;
  let completeRejecter;
  const completion = new Promise((resolve, reject) => {
    completeResolver = resolve;
    completeRejecter = reject;
  });

  const timeout = setTimeout(() => {
    completeRejecter(new Error("Timed out waiting for socket messages"));
  }, 30000);

  receiver.on("message", (data) => {
    if (!data?.id || !expectedIds.has(data.id) || receivedIds.has(data.id)) {
      return;
    }

    receivedIds.add(data.id);
    const startTime = sentAt.get(data.id);
    if (typeof startTime === "number") {
      latencies.push(performance.now() - startTime);
    }

    if (receivedIds.size === totalMessages) {
      clearTimeout(timeout);
      completeResolver();
    }
  });

  const start = performance.now();
  for (let index = 0; index < socketIterations; index += 1) {
    const id = `message-${index}-${Date.now()}`;
    expectedIds.add(id);
    sentAt.set(id, performance.now());
    sender.emit("message", {
      id,
      group_id: roomId,
      room: roomId,
      message: `benchmark message ${index}`,
      name: "Benchmark User",
      created_at: new Date().toISOString(),
    });
  }

  await completion;
  const totalElapsedMs = performance.now() - start;

  sender.disconnect();
  receiver.disconnect();

  const averageMs = latencies.reduce((sum, value) => sum + value, 0) / latencies.length;
  const sortedLatencies = latencies.slice().sort((a, b) => a - b);
  const p95Index = Math.max(0, Math.ceil(sortedLatencies.length * 0.95) - 1);
  const throughputPerSecond = (totalMessages / totalElapsedMs) * 1000;

  return {
    iterations: totalMessages,
    totalElapsedMs,
    averageMs,
    throughputPerSecond,
    p95Ms: sortedLatencies[p95Index] ?? averageMs,
  };
}

async function main() {
  const loginResults = await benchmarkLogin();
  const { authToken, ...loginMetrics } = loginResults;
  const roomId = await createBenchmarkGroup(authToken);
  const socketResults = await benchmarkSocket(roomId);

  console.log(
    JSON.stringify(
      {
        baseUrl,
        wsUrl,
        roomId,
        loginResults: loginMetrics,
        socketResults,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
