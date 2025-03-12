import {io,Socket} from 'socket.io-client';
let socket:Socket;
export const getSocket=()=>{
    if(!socket){
        socket=io("http://localhost:7000",{
            autoConnect:false
        });
    }
    return socket;
}