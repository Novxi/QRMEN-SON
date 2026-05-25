import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MenuItem from './MenuItem';

const getMotifClass = (motif) => (motif ? `category-motif-${motif}` : '');

export default function MenuCategory({ category, dietaryInfo, chefRecText }) {
  const [isOpen, setIsOpen] = useState(false);

  const file = category?.image?.trim() || 'placeholder.jpg';
  const bgUrl = `/images/${file}`;
  const headerStyle = {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const items = category?.items;

  const renderItems = () => {
    if (!items) return <p style={{ color: 'white' }}>Bu kategoride ürün bulunamadı.</p>;

    // Eğer array ise
    if (Array.isArray(items)) {
      return items.map((item, index) => (
        <MenuItem
          key={item.id || index}
          item={item}
          dietaryInfo={dietaryInfo}
          chefRecText={chefRecText}
          index={index}
        />
      ));
    }

    // Eğer grouped object ise
    if (typeof items === 'object') {
      return Object.entries(items).map(([groupName, groupItems]) => (
        <div key={groupName}>
          <h3 className="group-title">{groupName}</h3>
          {Array.isArray(groupItems) ? (
            groupItems.map((item, index) => (
              <MenuItem
                key={item.id || index}
                item={item}
                dietaryInfo={dietaryInfo}
                chefRecText={chefRecText}
                index={index}
              />
            ))
          ) : (
            <p style={{ color: 'white' }}>'{groupName}' grubu düzgün tanımlanmamış.</p>
          )}
        </div>
      ));
    }

    return <p style={{ color: 'white' }}>Tanımsız ürün formatı.</p>;
  };

  return (
    <section id={category.id} className="menu-category">
      <motion.div
        className={`category-header ${getMotifClass(category.motif)}`}
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={headerStyle}
      >
        <div className="category-header-content">
          <h2 className="category-name">{category.name}</h2>
          <p className="category-subtitle">{category.subtitle}</p>
        </div>
        <div className="category-motif-overlay" />
        <div className="category-arrow" />
      </motion.div>

      {isOpen && <div className="menu-items-grid">{renderItems()}</div>}
    </section>
  );
}
