
import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import AuthForm from '../components/AuthForm';
import PageTransition from '../components/PageTransition';

interface LoginProps {
  onAuthenticated: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  return (
    <PageTransition>
      <div className="animated-bg min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Logo />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8"
          >
            <AuthForm onAuthenticated={onAuthenticated} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-center text-sm text-inspired-text/70"
          >
            <p>For academic use only. By signing in, you agree to your school's terms of use.</p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
