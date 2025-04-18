import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Sparkles, MessageSquare, Heart } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ActionButton from './ActionButton';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { submitIdea, submitConcern, submitFeedback, checkIdea, checkConcern, shareIdea, shareConcern, shareFeedback } from '../api';
import { IdeaCheckResponse, ConcernCheckResponse, ApiResponse } from '@/interfaces/types';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreamingUpdate: boolean; // Add to type
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
    // Function to handle beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user is logged in but didn't select "Remember me"
      const isLoggedIn = sessionStorage.getItem('currentUserEmail') && !localStorage.getItem('authData');
      
      if (isLoggedIn) {
        // Standard way to show a confirmation dialog when leaving page
        const message = "Warning: You haven't selected 'Remember me'. Your login information will be lost if you leave this page.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
  
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array means this effect runs once on mount
  // Fixed authentication effect - runs only once and properly sets the email state
  useEffect(() => {
    // First try to get data from localStorage (for "Remember me" users)
    const storedAuth = localStorage.getItem('authData');
    
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.email) {
          setEmail(authData.email);
          console.log("Retrieved email from localStorage:", authData.email);
        }
      } catch (error) {
        console.error("Error parsing authentication data from localStorage:", error);
        localStorage.removeItem('authData');
      }
    } else {
      // If not in localStorage, check sessionStorage (for session-only users)
      const sessionEmail = sessionStorage.getItem('currentUserEmail');
      
      if (sessionEmail) {
        setEmail(sessionEmail);
        console.log("Retrieved email from sessionStorage:", sessionEmail);
      } else {
        console.log("No authentication data found in either localStorage or sessionStorage");
      }
    }
  }, []);

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
          timestamp: new Date(),
          isStreamingUpdate: false
        },
        {
          id: '2',
          text: "How can I assist you today! Would you like to share an idea, express a concern, or give feedback?",
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false
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
      timestamp: new Date(),
      isStreamingUpdate: false

    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {

      if (conversationType === 'ended') {
        setConversationType('general');
        setConversationStage('initial');
        setIsChatCompleted(false);
        setShowActions(false);
  
        // Custom "welcome back" message
        const aiMessage: MessageType = {
          id: uuidv4(),
          text: "Welcome back! How can I help you now?",
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        setShowActions(true);
        return;
      }
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
      console.error('Error during conversation handling:', error);
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
      try {
        setIsLoading(true);
        console.log('Starting idea submission with input:', input);
        const stream = await submitIdea(input);
        let fullResponse = '';
  
        console.log('Stream initiated');
  
        const initialAiMessage: MessageType = {
          id: uuidv4(),
          text: '',
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false,
        };
  
        setMessages(prev => [...prev, initialAiMessage]);
  
        // Track the last section to determine spacing
        let lastSection = '';
  
        await stream.onData((content: string) => {
          console.log('Received content:', JSON.stringify(content));
  
          // Normalize spacing based on content type
          if (content === "Title/Name of the Idea:") {
            fullResponse += content + '\n\n';
            lastSection = 'title';
          } else if (content === "Explanation / Benefits:") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'explanation';
          } else if (content === "Objective(s):") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'objectives';
          } else if (content === "**Process:**") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'process';
          } else if (content.startsWith('**') && content.endsWith(':**')) {
            // Subheading under Process
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'process-subheading';
          } else if (content.startsWith('- ')) {
            // Bullet point under Objective(s)
            fullResponse += content + '\n';
            lastSection = 'bullet';
          } else {
            // Paragraph or idea name
            if (lastSection === 'title') {
              fullResponse += content + '\n\n';
            } else if (lastSection === 'bullet') {
              fullResponse += content + (content.startsWith('- ') ? '\n' : '\n\n');
            } else {
              fullResponse += content + '\n\n';
            }
            lastSection = 'paragraph';
          }
  
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessageIndex = updatedMessages.length - 1;
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              text: fullResponse,
              isStreamingUpdate: true,
            };
            console.log('Updating messages, current fullResponse:', JSON.stringify(fullResponse));
            return updatedMessages;
          });
        });
  
        console.log('Stream completed, final response:', JSON.stringify(fullResponse));
        setConversationStage('ongoing');
        setCurrentProposal(fullResponse);
        setIsLoading(false);
  
      } catch (error) {
        console.error('Stream error:', error);
        toast({ 
          title: "Error", 
          description: "Failed to process stream", 
          variant: "destructive" 
        });
        setIsLoading(false);
      }
    } else if (conversationStage === 'ongoing') {
      // User has given feedback on the proposal
      try {
        setIsLoading(true);
    
        // Step 1: Check if the idea is ready
        const ideaCheckResponse = await checkIdea(input) as ApiResponse;
        console.log('Idea check response:', ideaCheckResponse);
        
        if (ideaCheckResponse?.text === "yes") {
          // Move to confirmation stage
          setConversationStage('confirmation');
          
          const confirmationMessage: MessageType = {
            id: uuidv4(),
            text: "Please confirm, would you like to submit your idea?",
            isUser: false,
            timestamp: new Date(),
            isStreamingUpdate: false
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          setIsConfirmed(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Step 2: If not ready, continue refining the idea
        const lastMessages = messages.slice(-10).map(m =>
          `${m.isUser ? 'User' : 'AI'}: ${m.text}`
        ).join("\n");
    
        const contextualInput = `Previous conversation:\n${lastMessages}\n\nNew user input:\n${input}`;
    
     
          setIsLoading(true);
     
          const stream = await submitIdea(contextualInput);
          let fullResponse = '';
  
        console.log('Stream initiated');
  
        const initialAiMessage: MessageType = {
          id: uuidv4(),
          text: '',
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false,
        };
  
        setMessages(prev => [...prev, initialAiMessage]);
  
        // Track the last section to determine spacing
        let lastSection = '';
  
        await stream.onData((content: string) => {
          console.log('Received content:', JSON.stringify(content));
  
          // Normalize spacing based on content type
          if (content === "Title/Name of the Idea:") {
            fullResponse += content + '\n\n';
            lastSection = 'title';
          } else if (content === "Explanation / Benefits:") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'explanation';
          } else if (content === "Objective(s):") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'objectives';
          } else if (content === "**Process:**") {
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'process';
          } else if (content.startsWith('**') && content.endsWith(':**')) {
            // Subheading under Process
            fullResponse += '\n\n' + content + '\n\n';
            lastSection = 'process-subheading';
          } else if (content.startsWith('- ')) {
            // Bullet point under Objective(s)
            fullResponse += content + '\n';
            lastSection = 'bullet';
          } else {
            // Paragraph or idea name
            if (lastSection === 'title') {
              fullResponse += content + '\n\n';
            } else if (lastSection === 'bullet') {
              fullResponse += content + (content.startsWith('- ') ? '\n' : '\n\n');
            } else {
              fullResponse += content + '\n\n';
            }
            lastSection = 'paragraph';
          }
  
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessageIndex = updatedMessages.length - 1;
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              text: fullResponse,
              isStreamingUpdate: true,
            };
            console.log('Updating messages, current fullResponse:', JSON.stringify(fullResponse));
            return updatedMessages;
          });
        });
  
        console.log('Stream completed, final response:', JSON.stringify(fullResponse));
        setConversationStage('ongoing');
        setCurrentProposal(fullResponse);
        setIsLoading(false);
    
        } catch (error) {
          console.error('Stream error:', error);
          toast({ 
            title: "Error", 
            description: "Failed to process stream", 
            variant: "destructive" 
          });
          setIsLoading(false);
        }finally {
        setIsLoading(false); // This might move inside onData/onError depending on desired behavior
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
        // Share the concern with the AP
        if (!email) {
          console.warn("No email available - concern sharing might not work properly");
        }
        console.log("Using email for sharing concern:", email);
        await shareConcern(input, email);
        
        setIsLoading(true);
    console.log('Starting concern submission with input:', input);
    const stream = await submitConcern(input); // Await initial fetch
    let fullResponse = '';

    console.log('Stream initiated');

    // Create an initial empty AI message
    const initialAiMessage: MessageType = {
      id: uuidv4(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isStreamingUpdate: false, // First appearance animates
    };

    // Add the initial empty message
    setMessages(prev => [...prev, initialAiMessage]);

    await stream.onData((chunk: string) => {
      console.log('Received content:', JSON.stringify(chunk));
      fullResponse += chunk;

      // Update the last message
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          text: fullResponse,
          isStreamingUpdate: true, // No animation for updates
        };
        console.log('Updating messages, current fullResponse:', JSON.stringify(fullResponse));
        return updatedMessages;
      });
    });

    stream.onError((error: any) => {
      console.error('Stream error:', error);
      toast({ title: "Error", description: "Streaming failed.", variant: "destructive" });
      stream.cleanup();
      setIsLoading(false);
    });

    console.log('Stream completed, final response:', JSON.stringify(fullResponse));
    setConversationStage('ongoing');
    setCurrentProposal(fullResponse);
    setIsLoading(false);

  } catch (error) {
    console.error('Error initiating concern stream:', error);
    toast({ title: "Error", description: "Failed to start stream.", variant: "destructive" });
    setIsLoading(false);
  }
    } else if (conversationStage === 'ongoing') {
      // User has responded to the initial concern handling
      try {
        setIsLoading(true);
        
        // Check if the concern conversation is complete
        const concernCheckResponse = await checkConcern(input) as ApiResponse;
        console.log(concernCheckResponse)
        if (concernCheckResponse?.text === "yes") {
          // Concern conversation is complete, show options
          const completionMessage: MessageType = {
            id: uuidv4(),
            text: "Thank you for sharing your concern. Would you like to continue the conversation, share an idea, give feedback, or end our conversation?",
            isUser: false,
            timestamp: new Date(),
            isStreamingUpdate: false
          };
          
          setMessages(prev => [...prev, completionMessage]);
          setShowConcernActions(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Get last 10 messages as context (including both user and AI)
        const lastMessages = messages.slice(-10).map(m => 
          `${m.isUser ? 'User' : 'AI'}: ${m.text}`
        ).join("\n");
  
        // Append user input with previous messages for context
        const contextualInput = `Previous conversation:\n${lastMessages}\n\nNew user input:\n${input}`;
  
        const stream = await submitConcern(contextualInput); // Await initial fetch
        setIsLoading(true);
        console.log('Starting concern submission with input:', input);
      // Await initial fetch
        let fullResponse = '';
    
        console.log('Stream initiated');
    
        // Create an initial empty AI message
        const initialAiMessage: MessageType = {
          id: uuidv4(),
          text: '',
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false, // First appearance animates
        };
    
        // Add the initial empty message
        setMessages(prev => [...prev, initialAiMessage]);
    
        await stream.onData((chunk: string) => {
          console.log('Received content:', JSON.stringify(chunk));
          fullResponse += chunk;
    
          // Update the last message
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessageIndex = updatedMessages.length - 1;
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              text: fullResponse,
              isStreamingUpdate: true, // No animation for updates
            };
            console.log('Updating messages, current fullResponse:', JSON.stringify(fullResponse));
            return updatedMessages;
          });
        });
    
        stream.onError((error: any) => {
          console.error('Stream error:', error);
          toast({ title: "Error", description: "Streaming failed.", variant: "destructive" });
          stream.cleanup();
          setIsLoading(false);
        });
    
        console.log('Stream completed, final response:', JSON.stringify(fullResponse));
        setConversationStage('ongoing');
        setCurrentProposal(fullResponse);
        setIsLoading(false);
    
      } catch (error) {
        console.error('Error initiating concern stream:', error);
        toast({ title: "Error", description: "Failed to start stream.", variant: "destructive" });
        setIsLoading(false);
      }finally {
        setIsLoading(false); // Consider moving this based on streaming completion
      }
    }
  };

  const handleFeedbackConversation = async (input: string) => {
    if (conversationStage === 'initial') {
      // Submit feedback
      try {
    
          setIsLoading(true);
          console.log('Starting feedback submission with input:', input);
          const stream = await submitFeedback(input); // Await initial fetch
          let fullResponse = '';
      
          console.log('Stream initiated');
      
          // Create an initial empty AI message
          const initialAiMessage: MessageType = {
            id: uuidv4(),
            text: '',
            isUser: false,
            timestamp: new Date(),
            isStreamingUpdate: false, // First appearance animates
          };
      
          // Add the initial empty message
          setMessages(prev => [...prev, initialAiMessage]);
      
          await stream.onData((chunk: string) => {
            console.log('Received content:', JSON.stringify(chunk));
            fullResponse += chunk;
      
            // Update the last message
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessageIndex = updatedMessages.length - 1;
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                text: fullResponse,
                isStreamingUpdate: true, // No animation for updates
              };
              console.log('Updating messages, current fullResponse:', JSON.stringify(fullResponse));
              return updatedMessages;
            });
          });
      
          stream.onError((error: any) => {
            console.error('Stream error:', error);
            toast({ title: "Error", description: "Streaming failed.", variant: "destructive" });
            stream.cleanup();
            setIsLoading(false);
          });
      
          console.log('Stream completed, final response:', JSON.stringify(fullResponse));
          setConversationStage('ongoing');
          setCurrentProposal(fullResponse);
          setIsLoading(false);
          setIsChatCompleted(true);
        } catch (error) {
          console.error('Error initiating feedback stream:', error);
          toast({ title: "Error", description: "Failed to start stream.", variant: "destructive" });
          setIsLoading(false);
        }
    }
  };

  // Handle confirmation response for idea submission
  const handleIdeaConfirmation = async (isConfirmed: boolean) => {
    
    // First, add the user's choice as a message

    const userMessage: MessageType = {
      id: uuidv4(),
      text: isConfirmed ? "Yes" : "No",
      isUser: true,
      timestamp: new Date(),
      isStreamingUpdate: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (isConfirmed) {
      setIsConfirmed(false)
      // User confirmed, submit the idea
      setIsLoading(true);
      try {
        // Get the last AI message as the final idea
        const lastAIMessage = messages.filter(m => !m.isUser).slice(-2).map(m => m.text).join(" ");
        console.log('Final idea to share:', lastAIMessage);
        
        if (lastAIMessage) {
          if (!email) {
            console.warn("No email available - idea sharing might not work properly");
          }
          console.log("Using email for sharing idea:", email);
          await shareIdea(lastAIMessage, email);
        } else {
          console.warn("No AI message found to share");
        }
        
        // Thank user and show final options
        const finalMessage: MessageType = {
          id: uuidv4(),
          text: "Thank you! Your idea has been submitted successfully. Would you like to share another idea, express a concern, give feedback, or end our conversation?",
          isUser: false,
          timestamp: new Date(),
          isStreamingUpdate: false
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setConversationStage('completed');
        setIsChatCompleted(true);
      } catch (error) {
        console.error('Error submitting idea confirmation:', error);
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
        timestamp: new Date(),
        isStreamingUpdate: false
      };
      
      setMessages(prev => [...prev, declineMessage]);
      setConversationStage('ongoing');
    }
    
    // Hide the confirmation buttons
    setIsConfirmed(false);
  };

  const handleConcernAction = (action: string) => {
    // Add the user's choice as a message

   
    
    // Hide the concern action buttons
    setShowConcernActions(false);
    
    if (action === "Continue conversation") {
      const userMessage: MessageType = {
        id: uuidv4(),
        text: action,
        isUser: true,
        timestamp: new Date(),
        isStreamingUpdate: false
      };

      const continueMessage: MessageType = {
        id: uuidv4(),
        text: "I'm here to continue discussing your concern. What else would you like to share?",
        isUser: false,
        timestamp: new Date(),
        isStreamingUpdate: false
      };
      
      setMessages(prev => [...prev, userMessage, continueMessage]);
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
    setIsChatCompleted(false);
    setConversationStage('initial');
    setCurrentProposal('');
    setShowConcernActions(false);
    
    let greeting = '';
    let help = '';
    switch(type) {
      case 'idea':
        greeting = "That's great! I'd love to hear your idea. Please provide a brief description of your idea, so that we can build a proposal form to share.";
        help = "I am still an AI, so my response may not be perfect, you can ask for changes, and I shall ask for confirmation before you want to submit your proposal form.";
        break;
      case 'feedback':
        greeting = "Thank you for wanting to provide feedback. What would you like to share about your experience?";
        break;
      case 'concern':
        greeting = "I'm here to listen and help with your concerns. What's troubling you?";
        break;
      case 'ended':
        greeting = "It was great chatting with you! If you have any other questions or concerns, or feedback please come back.";
        break;
      default:
        greeting = "How can I help you today?";
    }
    
    const userMessage: MessageType = {
      id: uuidv4(),
      text: option,
      isUser: true,
      timestamp: new Date(),
      isStreamingUpdate: false
    };
    
    const aiMessage: MessageType = {
      id: uuidv4(),
      text: greeting,
      isUser: false,
      timestamp: new Date(),
      isStreamingUpdate: false
    };
    if (type==='idea'){
      const aiMessage: MessageType = {
        id: uuidv4(),
        text: help,
        isUser: false,
        timestamp: new Date(),
        isStreamingUpdate: false
      };
    }
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
    if (type==='ended'){
      setIsChatCompleted(false);
      return;
    }
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
        timestamp: new Date(),
        isStreamingUpdate: false
      },
      {
        id: '2',
        text: "How can I assist you today! Would you like to share an idea, express a concern, or give feedback?",
        isUser: false,
        timestamp: new Date(),
        isStreamingUpdate: false
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
            onClick={() => {
              console.log("Button clicked in ChatInterface");
              onSignOut();
            }}
            className="text-white text-sm hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
{/* Messages Area */}
<div className="flex-1 overflow-y-auto p-4 bg-inspired-background">
  <div className="max-w-3xl mx-auto">
    <AnimatePresence>
      {messages.map((message, index) => (
        <ChatMessage
          key={`message-${message.id}`}
          message={message}
          isLastMessage={index === messages.length - 1}
        />
      ))}
    </AnimatePresence>
    {/* Rest of the code remains the same */}
          
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