import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreamingUpdate?: boolean;
};

interface ChatMessageProps {
  message: MessageType;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastMessage = false }) => {
  const shouldAnimate = !message.isStreamingUpdate && isLastMessage;

  return (
    <motion.div
      className={`mb-4 ${message.isUser ? 'ml-auto' : 'mr-auto'} max-w-[85%]`}
      initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
      transition={shouldAnimate ? { duration: 0.3 } : undefined}
    >
      <div
        className={`rounded-2xl px-4 py-3 ${
          message.isUser
            ? 'bg-inspired text-white ml-auto'
            : 'bg-white border border-border'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ children }) => (
              <p className="whitespace-pre-wrap leading-relaxed mb-4">{children}</p>
            ),
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mb-4 mt-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mb-4 mt-4">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-4">{children}</ol>,
            li: ({ children }) => <li className="mb-2">{children}</li>,
            strong: ({ children }) => <strong className="font-bold block mb-2">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-4 border-t border-gray-300" />,
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