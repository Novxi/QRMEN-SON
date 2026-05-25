import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DesktopNav = ({ categories, activeCategory, onCategoryClick }) => {
  const handleNavClick = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    onCategoryClick(categoryId);
  };

  return (
    <motion.nav
      className="desktop-nav"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="desktop-nav-inner">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            className={`desktop-nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleNavClick(category.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <span className="desktop-nav-indicator" />
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default DesktopNav;