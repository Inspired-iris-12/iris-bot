import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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
        {/* Render Markdown correctly */}
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside">{children}</ol>,
            li: ({ children }) => <li className="ml-4">{children}</li>,
            h1: ({ children }) => <h1 className="text-xl font-bold">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>,
          }}
        >
          {message.text}
        </ReactMarkdown>
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
