import { Server } from "socket.io";
import {Socket} from "socket.io";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CustomSocket extends Socket{
    room?:string;
}
export function setupSocket(io:Server){
    io.use((socket:CustomSocket,next)=>{
      const room=socket.handshake.auth.room||socket.handshake.headers.room;
        if(!room){
            return next(new Error("Room is required"));

        }
        socket.room=room;
        next()
    })
    io.on("connection",(socket:CustomSocket)=>{
        socket.join(socket.room)
        //console.log("Socket connected with id",socket.id);
        socket.on("message",async (data)=>{
            console.log("Message received",data);
            await prisma.chats.create({
                data:data,
            })
            socket.to(socket.room).emit("message",data);
        });
        socket.on("disconnect",()=>{
            console.log("Socket disconnected with id",socket.id);
        });
    });
}