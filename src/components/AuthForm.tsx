
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendOtp, verifyOtp } from '../lib/auth';
import OTPInput from './OTPInput';
import { toast } from '@/hooks/use-toast';
import { AtSign } from 'lucide-react';

interface AuthFormProps {
  onAuthenticated: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@') || !email.endsWith('@diyafahschool.com')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid school email ending with @diyafahschool.com",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await sendOtp(email);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code from your email",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await verifyOtp(email, otp, rememberMe);
      
      if (success) {
        toast({
          title: "Authenticated successfully",
          description: "Welcome to InspirED to Speak!",
        });
        onAuthenticated();
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code is incorrect or expired",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="glass-effect p-8 rounded-2xl shadow-sm w-full max-w-md mx-auto">
      {!otpSent ? (
        <motion.form 
          onSubmit={handleSendOtp}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-2xl font-semibold mb-6 text-center text-inspired-text"
            variants={itemVariants}
          >
            Sign in with your school email
          </motion.h2>
          
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@diyafahschool.com"
                className="form-input pl-10"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-inspired/70">
                <AtSign size={18} />
              </div>
            </div>
          </motion.div>
          
          <motion.button
            type="submit"
            className="primary-button w-full"
            disabled={isLoading}
            variants={itemVariants}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Verification Code"
            )}
          </motion.button>
        </motion.form>
      ) : (
        <motion.form 
          onSubmit={handleVerifyOtp}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-2xl font-semibold mb-2 text-center text-inspired-text"
            variants={itemVariants}
          >
            Enter verification code
          </motion.h2>
          
          <motion.p 
            className="text-center text-sm text-inspired-text/70 mb-6"
            variants={itemVariants}
          >
            We've sent a 6-digit code to {email}
          </motion.p>
          
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <OTPInput
              value={otp}
              onChange={setOtp}
              numDigits={6}
            />
          </motion.div>
          
          <motion.div 
            className="flex items-center mb-6" 
            variants={itemVariants}
          >
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-inspired focus:ring-inspired/50"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-inspired-text">
              Remember me
            </label>
            
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="ml-auto text-sm text-inspired hover:text-inspired-dark"
            >
              Change email
            </button>
          </motion.div>
          
          <motion.button
            type="submit"
            className="primary-button w-full"
            disabled={isLoading}
            variants={itemVariants}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify & Sign In"
            )}
          </motion.button>
        </motion.form>
      )}
    </div>
  );
};

export default AuthForm;
