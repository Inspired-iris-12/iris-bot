
import React from 'react';
import { motion } from 'framer-motion';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <motion.div
      className={`mb-4 ${message.isUser ? 'ml-auto' : 'mr-auto'} max-w-[85%]`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`rounded-2xl px-4 py-3 ${
          message.isUser 
            ? 'bg-inspired text-white ml-auto' 
            : 'bg-white border border-border'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      <div 
        className={`text-xs mt-1 text-gray-500 ${
          message.isUser ? 'text-right' : 'text-left'
        }`}
      >
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
