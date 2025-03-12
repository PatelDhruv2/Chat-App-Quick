import React from 'react';
import ChatBase from '@/components/chat/ChatBase';
import { fetchChatGroup } from '@/fetch/roupFetch';
import { ChatGroupType, GroupChatUserType } from '../../../../type';
import NotFound from '../../not-found';
import { fetchChatUsers } from '@/fetch/roupFetch';
import { fetchChats } from '@/fetch/chatfetch';
import { MessageType } from '../../../../type';
const chat = async ({ params }: { params: { id: string } }) => {
    if(params.id.length!==36){
        return  NotFound() ;
    }
    
    const group:ChatGroupType|null = await fetchChatGroup(params.id);
    if(!group){
        return NotFound
    }
    const users:Array<GroupChatUserType> = await fetchChatUsers(params.id);
    console.log("Users",users);
    const chats:Array<MessageType> = await fetchChats(params.id);
    return (
        <div>
            <ChatBase users={users} group={group} oldMessages={chats}/>
        </div>
    );
};

export default chat;
