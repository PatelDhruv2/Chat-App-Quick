"use client";
import React from 'react'
import { useEffect,useMemo } from 'react';
import { getSocket } from '@/lib/socket.config';
import {v4 as uuidv4} from 'uuid';
import { Button } from '@/components/ui/button';
import ChatSidebar from './ChatSideBar';
import { ChatGroupType, MessageType } from '../../../type';
import { GroupChatUserType } from '../../../type';
import ChatNav from './ChatNav';
import ChatUserDialog from './ChatUserDialog';
import Chats from './Chat';
const ChatBase = ({group,users,oldMessages}:{group:ChatGroupType,users:Array<GroupChatUserType>|null,oldMessages:
    Array<MessageType>|null
}) => {
    // let socket = useMemo(() => {
    //     const socket = getSocket();
    //     socket.auth={
    //         room:groupId
    //     }
    //     return socket.connect();
    // }, []);
    // useEffect(() => {
    //     socket.on("message",(data:any)=>{
    //         console.log("Message received",data);
    //     })
    //     return () => {
    //         socket.disconnect();
    //     };
    // },[]);
   const [open,setOpen] = React.useState(true);
   const [chatuser,setChatUser] = React.useState<GroupChatUserType|null>(null);
   useEffect(()=>{
    const data=localStorage.getItem(group.id);
    if(data){
        const Data=JSON.parse(data);
        setChatUser(Data);
    }
   },[])
  return (
    <div className="flex">
       <ChatSidebar users={users || []}/>
       <div className="w-full md:w-4/5 bg-gradient-to-b from-gray-100 to-white">
       {open?<ChatUserDialog open={open} setOpen={setOpen} group={group}/>:<ChatNav chatGroup={group} users={users || []}/>}
        <Chats group={group}  oldMessages={oldMessages || []} chatUser={chatuser || null} />
       </div>
    </div>
  )
} 
export default ChatBase