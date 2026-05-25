import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero = ({ tableNumber, translations, onViewMenu }) => {
  return (
    <div className="hero-section">
      {/* Background Image */}
      <div className="hero-background-image" style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}>
        <div className="hero-video-overlay" />
      </div>

      {/* Content */}
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="logo-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <svg className="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
            <path
              d="M50 20 L55 35 L50 50 L45 35 Z M50 50 L65 55 L50 60 L35 55 Z M50 60 L55 75 L50 80 L45 75 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="35" r="3" fill="currentColor" />
            <circle cx="35" cy="55" r="3" fill="currentColor" />
            <circle cx="65" cy="55" r="3" fill="currentColor" />
            <circle cx="50" cy="75" r="3" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Restaurant Name */}
        <motion.h1
          className="restaurant-name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Sisly Resort
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {translations.tagline}
        </motion.p>

        {/* View Menu Button */}
        <motion.button
          className="view-menu-btn"
          onClick={onViewMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {translations.viewMenu}
          <ChevronDown className="ml-2" size={20} />
        </motion.button>
      </motion.div>

      {/* Table Number Badge */}
      {tableNumber && (
        <motion.div
          className="table-badge"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="table-label">{translations.table}</span>
          <span className="table-number">{tableNumber}</span>
        </motion.div>
      )}
    </div>
  );
};

export default Hero;