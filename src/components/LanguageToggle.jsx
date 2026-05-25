import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ currentLang, onToggle }) => {
  return (
    <motion.button
      className="language-toggle"
      
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Globe size={18} />
      <span className="language-label">{currentLang === 'en' ? 'TR' : 'EN'}</span>
    </motion.button>
  );
};

export default LanguageToggle;