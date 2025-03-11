import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import {Server} from 'socket.io';
import { createServer } from 'http';
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const server=createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*"
  }
});
setupSocket(io);
export {io};
const PORT = process.env.PORT || 7000; // Changed default port to 7000

app.use(cors());
app.use(express.json());
app.use('/api', routes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
