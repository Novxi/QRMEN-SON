import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

const SearchBar = ({ categories, onSearch, isOpen, onToggle, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      onSearch([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matchedItems = [];

    categories.forEach((category) => {
      category.items.forEach((item) => {
        const nameMatch = item.name.toLowerCase().includes(term);
        const descMatch = item.description.toLowerCase().includes(term);

        if (nameMatch || descMatch) {
          matchedItems.push({
            ...item,
            categoryId: category.id,
            categoryName: category.name,
          });
        }
      });
    });

    setResults(matchedItems);
    onSearch(matchedItems);
  }, [searchTerm, categories]);

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    onSearch([]);
  };

  const scrollToItem = (categoryId) => {
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
    onToggle();
  };

  return (
    <>
      {/* Search Toggle Button */}
      <motion.button
        className="search-toggle-btn"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Search size={20} />
      </motion.button>

      {/* Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
          >
            <motion.div
              className="search-container"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <Input
                  type="text"
                  placeholder={lang === 'en' ? 'Search menu...' : 'Menüde ara...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                {searchTerm && (
                  <button className="search-clear-btn" onClick={handleClear}>
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <motion.div
                  className="search-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  {results.map((item, index) => (
                    <motion.button
                      key={`${item.categoryId}-${item.id}`}
                      className="search-result-item"
                      onClick={() => scrollToItem(item.categoryId)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="search-result-content">
                        <span className="search-result-name">{item.name}</span>
                        <span className="search-result-category">{item.categoryName}</span>
                      </div>
                      <span className="search-result-price">₺{item.price}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {searchTerm && results.length === 0 && (
                <div className="search-no-results">
                  {lang === 'en' ? 'No items found' : 'Öğe bulunamadı'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchBar;