
import React from 'react';
import { signOut } from '../lib/auth';
import ChatInterface from '../components/ChatInterface';
import PageTransition from '../components/PageTransition';

interface ChatProps {
  onSignOut: () => void;
}

const Chat: React.FC<ChatProps> = ({ onSignOut }) => {
  const handleSignOut = () => {
    signOut();
    onSignOut();
  };

  return (
    <PageTransition>
      <div className="h-screen flex flex-col overflow-hidden">
        <ChatInterface onSignOut={handleSignOut} />
      </div>
    </PageTransition>
  );
};

export default Chat;
