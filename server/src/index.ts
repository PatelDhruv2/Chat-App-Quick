import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { setupSocket } from './socket.js';
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from './config/redis.config.js';
import { instrument } from "@socket.io/admin-ui";
import { connectKafka } from "./config/kafka.js"; // Import Kafka connection function

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
  },
  adapter: createAdapter(redis),
});

// Socket.io Admin UI for monitoring
instrument(io, {
  auth: false,
  mode: "development",
});

// Initialize Kafka and WebSockets
(async () => {
  await connectKafka(); // 🔥 Connect to Kafka
  setupSocket(io);
})();

export { io };

const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;