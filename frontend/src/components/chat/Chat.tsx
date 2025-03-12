import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { v4 as uuidv4 } from "uuid";
import { ChatGroupType, GroupChatUserType, MessageType } from "../../../type";

export default function Chats({
  group,
  oldMessages,
  chatUser,
}: {
  group: ChatGroupType;
  oldMessages: Array<MessageType>;
  chatUser?: GroupChatUserType;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const socket = useMemo(() => {
    const socketInstance = getSocket();
    socketInstance.auth = { room: group.id };
    return socketInstance.connect();
  }, [group.id]);

  useEffect(() => {
    const socketInstance = getSocket();
    socketInstance.auth = { room: group.id };
    socketInstance.connect();
  
    socketInstance.on("message", (data: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });
  
    return () => {
      socketInstance.close();
    };
  }, [group.id]); // Depend only on `group.id`
  

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!message.trim()) return; // Prevent empty messages

    const payload: MessageType = {
      id: uuidv4(),
      message,
      name: chatUser?.name ?? "Unknown",
      created_at: new Date().toISOString(),
      group_id: group.id,
    };

    socket.emit("message", payload);
    setMessage("");

    setMessages((prevMessages) => [...prevMessages, payload]);
  };

  return (
    <div className="flex flex-col h-[94vh] p-4">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef} />
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id} // Ensures unique keys
              className={`max-w-sm rounded-lg p-2 ${
                msg.name === chatUser?.name
                  ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white self-end"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 text-black self-start"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </div>
  );
}
