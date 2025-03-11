import { Server } from "socket.io";
export function setupSocket(io:Server){
    io.on("connection",(socket)=>{
        console.log("Socket connected with id",socket.id);
        socket.on("disconnect",()=>{
            console.log("Socket disconnected with id",socket.id);
        });
    });
}