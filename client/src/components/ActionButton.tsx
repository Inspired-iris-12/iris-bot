
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <motion.button
      className="w-full bg-inspired hover:bg-inspired-dark text-white rounded-xl py-4 px-6 shadow-sm transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

export default ActionButton;
