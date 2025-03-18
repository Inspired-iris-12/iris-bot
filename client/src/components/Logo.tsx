
import React from 'react';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  return (
    <motion.div 
      className="text-center py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h1 className="text-3xl font-medium tracking-wide text-inspired-text">
        <span className="font-semibold">Inspir</span>
        <span className="font-bold">ED</span>
        <span className="font-semibold"> to Speak</span>
      </h1>
    </motion.div>
  );
};

export default Logo;
