import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


const MobileTabBar = ({ categories, activeCategory, onCategoryClick }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeIndex = categories.findIndex((cat) => cat.id === activeCategory);
    if (activeIndex !== -1) {
      const tabWidth = 100 / categories.length;
      setIndicatorStyle({
        left: `${activeIndex * tabWidth}%`,
        width: `${tabWidth}%`,
      });
    }
  }, [activeCategory, categories]);

  const handleTabClick = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 80;
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
    <div className="mobile-tab-bar">
      <div className="mobile-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`mobile-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleTabClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <motion.div
        className="mobile-tab-indicator"
        style={indicatorStyle}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default MobileTabBar;