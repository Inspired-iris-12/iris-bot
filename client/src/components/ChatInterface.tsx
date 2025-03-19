import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Sparkles, MessageSquare, Heart } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ActionButton from './ActionButton';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { submitIdea, submitConcern, submitFeedback, checkIdea, checkConcern, shareIdea, shareConcern } from '../api';
import { IdeaCheckResponse, ConcernCheckResponse, ApiResponse } from '@/interfaces/types';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};


type ConversationType = 'idea' | 'feedback' | 'concern' | 'general' | 'ended';
type ConversationStage = 'initial' | 'ongoing' | 'confirmation' | 'completed';

interface ChatInterfaceProps {
  onSignOut: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSignOut }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [conversationType, setConversationType] = useState<ConversationType>('general');
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
  const [showActions, setShowActions] = useState(true);
  const [currentProposal, setCurrentProposal] = useState<string>('');
  const [showConcernActions, setShowConcernActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    const storedAuth = localStorage.getItem('authData');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Check if the stored auth data is still valid
        // You might want to add token validation or expiry check here
        if (authData.email) {
          setEmail(authData.email);
          // Automatically authenticate the user
        }
      } catch (error) {
        // If there's an error parsing the stored data, clear it
        localStorage.removeItem('authData');
      }
    }
  });

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
      id: uuidv4(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Handle based on conversation type and stage
      if (conversationType === 'idea') {
        await handleIdeaConversation(inputText);
      } else if (conversationType === 'concern') {
        await handleConcernConversation(inputText);
      } else if (conversationType === 'feedback') {
        await handleFeedbackConversation(inputText);
      } else {
        // General conversation - check for type changes
        setIsChatCompleted(true);
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

  const handleIdeaConversation = async (input: string) => {
    if (conversationStage === 'initial') {
      // First submission of an idea
      try {
        const response = await submitIdea(input) as ApiResponse;
        console.log('hi', response);
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: response.text,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setCurrentProposal(response.text);
        setConversationStage('ongoing');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your idea. Please try again.",
          variant: "destructive"
        });
      }
    } else if (conversationStage === 'ongoing') {
      // User has given feedback on the proposal
      try {
        setIsLoading(true);
    
        // Step 1: Check if the idea is ready
        const ideaCheckResponse = await checkIdea(input) as ApiResponse;
        console.log('idea', ideaCheckResponse);
        if (ideaCheckResponse?.text === "yes") {
          // Move to confirmation stage
          setConversationStage('confirmation');
          
          const confirmationMessage: MessageType = {
            id: uuidv4(),
            text: "Your idea is ready to be submitted. Would you like to proceed?",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          setIsConfirmed(true);
          return;
        }
    
        // Step 2: If not ready, continue refining the idea
        const lastMessages = messages.slice(-10).map(m =>
          `${m.isUser ? 'User' : 'AI'}: ${m.text}`
        ).join("\n");
    
        const contextualInput = `Previous conversation:\n${lastMessages}\n\nNew user input:\n${input}`;
    
        const response = await submitIdea(contextualInput) as ApiResponse;
    
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: response.text,
          isUser: false,
          timestamp: new Date()
        };
    
        setMessages(prev => [...prev, aiMessage]);
    
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your response. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else if (conversationStage === 'completed') {
      // Check if user wants to do something else
      setIsChatCompleted(true);
    }
  };

  const handleConcernConversation = async (input: string) => {
    if (conversationStage === 'initial') {
      // First submission of a concern
      try {
        // Share the concern with the API
        await shareConcern(input, email);
        
        const response = await submitConcern(input) as ApiResponse;
        
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: response.text,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationStage('ongoing');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your concern. Please try again.",
          variant: "destructive"
        });
      }
    } else if (conversationStage === 'ongoing') {
      // User has responded to the initial concern handling
      try {
        setIsLoading(true);
        
        // Check if the concern conversation is complete
        const concernCheckResponse = await checkConcern(input) as ApiResponse;
        
        if (concernCheckResponse?.text === "yes") {
          // Concern conversation is complete, show options
          const completionMessage: MessageType = {
            id: uuidv4(),
            text: "Thank you for sharing your concern. Would you like to continue the conversation, share an idea, give feedback, or end our conversation?",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, completionMessage]);
          setShowConcernActions(true);
          return;
        }
  
        // Get last 10 messages as context (including both user and AI)
        const lastMessages = messages.slice(-10).map(m => 
          `${m.isUser ? 'User' : 'AI'}: ${m.text}`
        ).join("\n");
  
        // Append user input with previous messages for context
        const contextualInput = `Previous conversation:\n${lastMessages}\n\nNew user input:\n${input}`;
  
        const response = await submitConcern(contextualInput) as ApiResponse;
  
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: response.text,
          isUser: false,
          timestamp: new Date()
        };
  
        setMessages(prev => [...prev, aiMessage]);
  
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your response. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFeedbackConversation = async (input: string) => {
    if (conversationStage === 'initial') {
      // Submit feedback
      try {
        const response = await submitFeedback(input) as ApiResponse;
        
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: response.text + "\n\nThank you for your feedback! Would you like to share an idea, express a concern, give more feedback, or end our conversation?",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationStage('completed');
        setShowActions(true);
        setConversationType('general');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process your feedback. Please try again.",
          variant: "destructive"
        });
      }
    } else if (conversationStage === 'completed') {
      // Check if user wants to do something else
      setIsChatCompleted(true);
    }
  };

  // Handle confirmation response for idea submission
  const handleIdeaConfirmation = async (isConfirmed: boolean) => {
    // First, add the user's choice as a message
    const userMessage: MessageType = {
      id: uuidv4(),
      text: isConfirmed ? "Yes" : "No",
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (isConfirmed) {
      // User confirmed, submit the idea
      setIsLoading(true);
      try {
        // Get the last AI message as the final idea
        const lastAIMessage = messages.filter(m => !m.isUser).slice(-2)[0]?.text || '';
        console.log(lastAIMessage)
        if (lastAIMessage) {
          console.log(email)
          await shareIdea(lastAIMessage, email);
        }
        
        // Thank user and show final options
        const finalMessage: MessageType = {
          id: uuidv4(),
          text: "Thank you! Your idea has been submitted successfully. Would you like to share another idea, express a concern, give feedback, or end our conversation?",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setConversationStage('completed');
        setIsChatCompleted(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit your idea. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // User declined, go back to refining the idea
      const declineMessage: MessageType = {
        id: uuidv4(),
        text: "No problem. Let's continue refining your idea. What would you like to change or add?",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, declineMessage]);
      setConversationStage('ongoing');
    }
    
    // Hide the confirmation buttons
    setIsConfirmed(false);
  };

  const handleConcernAction = (action: string) => {
    // Add the user's choice as a message
    const userMessage: MessageType = {
      id: uuidv4(),
      text: action,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Hide the concern action buttons
    setShowConcernActions(false);
    
    if (action === "Continue conversation") {
      const continueMessage: MessageType = {
        id: uuidv4(),
        text: "I'm here to continue discussing your concern. What else would you like to share?",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, continueMessage]);
      // Stay in ongoing stage
    } else if (action === "Share an idea") {
      startNewConversation('idea', 'Share an idea');
    } else if (action === "Give feedback") {
      startNewConversation('feedback', 'Give feedback');
    } else if (action === "End conversation") {
      startNewConversation('ended', 'End conversation');
    }
  };

  const startNewConversation = (type: ConversationType, option: string) => {
    setConversationType(type);
    setShowActions(false);
    setConversationStage('initial');
    setCurrentProposal('');
    setShowConcernActions(false);
    
    let greeting = '';
    
    switch(type) {
      case 'idea':
        greeting = "That's great! I'd love to hear your idea. Please provide a brief description of your idea.";
        break;
      case 'feedback':
        greeting = "Thank you for wanting to provide feedback. What would you like to share about your experience?";
        break;
      case 'concern':
        greeting = "I'm here to listen and help with your concerns. What's troubling you?";
        break;
      case 'ended':
        greeting = "It was great chatting with you! If you have any other questions or concerns, or feedback plese come back";
        break;
      default:
        greeting = "How can I help you today?";
    }
    
    const userMessage: MessageType = {
      id: uuidv4(),
      text: option,
      isUser: true,
      timestamp: new Date()
    };
    
    const aiMessage: MessageType = {
      id: uuidv4(),
      text: greeting,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
  };

  const handleBack = () => {
    setShowActions(true);
    setConversationType('general');
    setConversationStage('initial');
    setCurrentProposal('');
    setIsConfirmed(false);
    setShowConcernActions(false);
    
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
                onClick={() => startNewConversation('idea', 'Share an Idea')}
              />
              <ActionButton 
                label="Express a concern" 
                onClick={() => startNewConversation('concern', 'Express a concern')}
              />
              <ActionButton 
                label="Give feedback" 
                onClick={() => startNewConversation('feedback', 'Give feedback')}
              />
            </motion.div>
          )}

          {/* Concern Action Buttons */}
          {showConcernActions && (
            <motion.div 
              className="flex flex-col space-y-3 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <ActionButton 
                label="Continue conversation" 
                onClick={() => handleConcernAction('Continue conversation')}
              />
              <ActionButton 
                label="Share an idea" 
                onClick={() => handleConcernAction('Share an idea')}
              />
              <ActionButton 
                label="Give feedback" 
                onClick={() => handleConcernAction('Give feedback')}
              />
              <ActionButton 
                label="End conversation" 
                onClick={() => handleConcernAction('End conversation')}
              />
            </motion.div>
          )}

          {isChatCompleted && messages.length >= 2 && (
            <motion.div 
              className="flex flex-col space-y-3 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <ActionButton 
                label="Share an idea" 
                onClick={() => startNewConversation('idea', 'Share an Idea')}
              />
              <ActionButton 
                label="Express a concern" 
                onClick={() => startNewConversation('concern', 'Express a concern')}
              />
              <ActionButton 
                label="Give feedback" 
                onClick={() => startNewConversation('feedback', 'Give feedback')}
              />
              <ActionButton 
                label="End Conversation" 
                onClick={() => startNewConversation('ended', "End Conversation")}
              />
            </motion.div>
          )}

          {/* Confirmation Buttons */}
          {isConfirmed && (
            <motion.div 
              className="flex flex-col space-y-3 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <ActionButton 
                label="Yes" 
                onClick={() => handleIdeaConfirmation(true)}
              />
              <ActionButton 
                label="No" 
                onClick={() => handleIdeaConfirmation(false)}
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
            disabled={isLoading || showActions || isChatCompleted || isConfirmed || showConcernActions}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim() || showActions || isChatCompleted || isConfirmed || showConcernActions}
            className="bg-inspired hover:bg-inspired-dark disabled:bg-inspired/50 disabled:cursor-not-allowed text-white px-4 rounded-r-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;