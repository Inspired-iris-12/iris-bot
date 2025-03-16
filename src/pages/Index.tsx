
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import Login from './Login';
import Chat from './Chat';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    setAuthenticated(isAuthenticated());
  }, []);

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  const handleSignOut = () => {
    setAuthenticated(false);
  };

  // Show loading state while checking authentication
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inspired-background">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-inspired animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-inspired animate-pulse delay-150"></div>
          <div className="w-3 h-3 rounded-full bg-inspired animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {authenticated ? (
        <Chat key="chat" onSignOut={handleSignOut} />
      ) : (
        <Login key="login" onAuthenticated={handleAuthenticated} />
      )}
    </AnimatePresence>
  );
};

export default Index;
