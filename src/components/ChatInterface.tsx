
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Sparkles, MessageSquare, Heart } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ActionButton from './ActionButton';
import { useToast } from '@/hooks/use-toast';
import { getChatResponse, submitProposal } from '../lib/ai';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ConversationType = 'idea' | 'feedback' | 'concern' | 'general';
type ConversationStage = 'initial' | 'ongoing' | 'confirmation' | 'completed';

interface ChatInterfaceProps {
  onSignOut: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSignOut }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationType, setConversationType] = useState<ConversationType>('general');
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
  const [showActions, setShowActions] = useState(true);
  const [currentProposal, setCurrentProposal] = useState<string>('');
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
      // For idea conversation type in confirmation stage, handle differently
      if (conversationType === 'idea' && conversationStage === 'confirmation') {
        if (inputText.toLowerCase().includes('yes') || inputText.toLowerCase().includes('confirm') || inputText.toLowerCase().includes('submit')) {
          // Submit the proposal to the server
          await submitProposal(currentProposal);
          
          const confirmationMessage: MessageType = {
            id: Date.now().toString(),
            text: "Your proposal has been submitted successfully! Would you like to share another idea, express a concern, give feedback, or end our conversation?",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          setConversationStage('completed');
          setCurrentProposal('');
        } else {
          // User doesn't want to submit yet, go back to ongoing stage
          const responseMessage: MessageType = {
            id: Date.now().toString(),
            text: "No problem. You can continue refining your proposal. What changes would you like to make?",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, responseMessage]);
          setConversationStage('ongoing');
        }
      } else {
        // Normal message flow
        const response = await getChatResponse(inputText, conversationType, messages, conversationStage);
        
        // Check if the response contains a proposal form for idea type
        if (conversationType === 'idea' && response.includes('**Title/Name of the Idea:**')) {
          setCurrentProposal(response);
          
          if (conversationStage === 'initial' || conversationStage === 'ongoing') {
            // After generating a proposal, ask if they want to submit it
            const followUpMessage = "Are you satisfied with this proposal? Would you like to submit it, or would you like to make changes?";
            
            const aiMessage: MessageType = {
              id: (Date.now() + 1).toString(),
              text: response + "\n\n" + followUpMessage,
              isUser: false,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
            setConversationStage('ongoing');
          }
        } 
        // For idea type that already has a proposal and user made changes
        else if (conversationType === 'idea' && conversationStage === 'ongoing' && currentProposal) {
          const aiMessage: MessageType = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Update the current proposal
          setCurrentProposal(response);
          
          // Ask for confirmation
          const confirmationMessage: MessageType = {
            id: (Date.now() + 2).toString(),
            text: "Are you ready to submit this proposal now? Please confirm.",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          setConversationStage('confirmation');
        }
        // For concern or feedback, check if user wants to continue or do something else
        else if ((conversationType === 'concern' || conversationType === 'feedback') && 
                 (response.includes("Would you like to share an idea") || 
                  response.includes("end our conversation"))) {
          const aiMessage: MessageType = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          // The response already contains the prompt for next steps
        }
        // Regular response
        else {
          const aiMessage: MessageType = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
        
        // Check for specific phrases that indicate the user wants to change conversation type
        checkForConversationTypeChange(inputText.toLowerCase());
      }
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

  const checkForConversationTypeChange = (text: string) => {
    // Check if the user wants to start a different type of conversation
    if (text.includes('share an idea') || text.includes('have an idea')) {
      startNewConversation('idea');
    } else if (text.includes('express a concern') || text.includes('have a concern')) {
      startNewConversation('concern');
    } else if (text.includes('give feedback') || text.includes('provide feedback')) {
      startNewConversation('feedback');
    } else if (text.includes('end conversation') || text.includes('end chat') || text.includes('goodbye')) {
      handleBack();
    }
  };

  const startNewConversation = (type: ConversationType) => {
    setConversationType(type);
    setShowActions(false);
    setConversationStage('initial');
    setCurrentProposal('');
    
    let greeting = '';
    
    switch(type) {
      case 'idea':
        greeting = "That's great! I'd love to hear your idea. Please provide a brief description, and I'll help you develop a complete proposal form.";
        break;
      case 'feedback':
        greeting = "Thank you for wanting to provide feedback. What would you like to share about your experience?";
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
    setConversationStage('initial');
    setCurrentProposal('');
    
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
