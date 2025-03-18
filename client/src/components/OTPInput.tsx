
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  numDigits: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, numDigits }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    // Initialize array of refs
    inputRefs.current = Array(numDigits).fill(null);
  }, [numDigits]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    
    if (val === '' || /^\d$/.test(val)) {
      // Update the digit at the current index
      const newValue = value.split('');
      newValue[index] = val;
      onChange(newValue.join(''));
      
      // If a digit was entered and we're not at the last input, focus next input
      if (val !== '' && index < numDigits - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (value[index] === '' && index > 0) {
        // If current input is empty and we're not at first input, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle left arrow key
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow key
    if (e.key === 'ArrowRight' && index < numDigits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').substring(0, numDigits);
    
    if (pastedDigits) {
      // Fill the OTP inputs with pasted digits
      onChange(pastedDigits.padEnd(numDigits, ''));
      
      // Focus the next empty input
      const nextIndex = Math.min(pastedDigits.length, numDigits - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between space-x-2">
      {Array.from({ length: numDigits }, (_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="w-full"
        >
          <input
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-full h-12 text-center font-semibold text-lg bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-inspired/50 transition-all"
            aria-label={`Digit ${i + 1}`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OTPInput;
