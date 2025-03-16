
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Sparkles, MessageSquare, Heart } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ActionButton from './ActionButton';
import { useToast } from '@/hooks/use-toast';
import { getChatResponse } from '../lib/ai';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ConversationType = 'idea' | 'feedback' | 'concern' | 'general';

interface ChatInterfaceProps {
  onSignOut: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSignOut }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationType, setConversationType] = useState<ConversationType>('general');
  const [showActions, setShowActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting when the chat loads
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          text: "Hi I'm iris",
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '2',
          text: "How can I assist you today! Would you like to share an idea, express a concern, or give feedback?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }, 500);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await getChatResponse(inputText, conversationType);
      
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = (type: ConversationType) => {
    setConversationType(type);
    setShowActions(false);
    
    let greeting = '';
    
    switch(type) {
      case 'idea':
        greeting = "That's great! I'd love to hear your idea. What's on your mind?";
        break;
      case 'feedback':
        greeting = "Thank you for wanting to provide feedback. What would you like to share?";
        break;
      case 'concern':
        greeting = "I'm here to listen and help with your concerns. What's troubling you?";
        break;
      default:
        greeting = "How can I help you today?";
    }
    
    const aiMessage: MessageType = {
      id: Date.now().toString(),
      text: greeting,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleBack = () => {
    setShowActions(true);
    setConversationType('general');
    
    // Clear previous conversation and start fresh
    setMessages([
      {
        id: '1',
        text: "Hi I'm iris",
        isUser: false,
        timestamp: new Date()
      },
      {
        id: '2',
        text: "How can I assist you today! Would you like to share an idea, express a concern, or give feedback?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <motion.div 
      className="flex flex-col h-full max-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-inspired py-4 px-6 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!showActions && (
              <button 
                onClick={handleBack}
                className="text-white hover:bg-inspired-dark rounded-full p-1 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-semibold text-white">InspirED to Speak</h1>
          </div>
          <button 
            onClick={onSignOut}
            className="text-white text-sm hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-inspired-background">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}
          </AnimatePresence>
          
          {/* Quick Action Buttons */}
          {showActions && messages.length >= 2 && (
            <motion.div 
              className="flex flex-col space-y-3 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <ActionButton 
                label="Share an idea" 
                onClick={() => startNewConversation('idea')}
              />
              <ActionButton 
                label="Express a concern" 
                onClick={() => startNewConversation('concern')}
              />
              <ActionButton 
                label="Give feedback" 
                onClick={() => startNewConversation('feedback')}
              />
            </motion.div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="py-4">
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex space-x-2 items-center text-inspired">
                  <div className="w-2 h-2 rounded-full bg-inspired animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-inspired animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-inspired animate-pulse delay-150"></div>
                </div>
              </motion.div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      {!showActions && (
        <div className="bg-white p-4 border-t border-border">
          <div className="max-w-3xl mx-auto flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1 py-3 px-4 rounded-l-xl border border-r-0 border-border focus:outline-none focus:ring-2 focus:ring-inspired/30"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-inspired hover:bg-inspired-dark disabled:bg-inspired/50 disabled:cursor-not-allowed text-white px-4 rounded-r-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatInterface;
