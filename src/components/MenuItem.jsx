import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from './ui/card';

const MenuItem = ({ item, dietaryInfo, chefRecText, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="menu-item-card">
        <motion.div
          className="menu-item-image-container"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={item.image}
            alt={item.name}
            className="menu-item-image"
            loading="lazy"
          />
          {item.chefRec && (
            <div className="chef-rec-badge" title={chefRecText}>
              <Star size={16} fill="currentColor" />
            </div>
          )}
        </motion.div>

        <div className="menu-item-content">
          <div className="menu-item-header">
            <h3 className="menu-item-name">{item.name}</h3>
            <span className="menu-item-price">₺{item.price}</span>
          </div>

          <p className="menu-item-description">{item.description}</p>

{item.badges && item.badges.length > 0 && (
  <div className="dietary-badges">
    {item.badges.map((badge) => (
      <span
        key={badge}
        className="dietary-badge"
        title={dietaryInfo && dietaryInfo[badge] ? dietaryInfo[badge] : ''}
      >
        {badge}
      </span>
    ))}
  </div>
)}
        </div>
      </Card>
    </motion.div>
  );
};

export default MenuItem;