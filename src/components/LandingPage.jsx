import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleNavigation = (path) => {
    setFadeOut(true);
    setTimeout(() => {
      navigate(path);
    }, 600);
  };

  return (
    <div className={`landing-container ${fadeOut ? 'fade-out' : ''}`}>
      {/* Background */}
      <div className="landing-background">
        <div className="landing-overlay"></div>
      </div>

      <div className={`landing-content ${isVisible ? 'visible' : ''}`}>
        {/* Logo */}
        <div className="logo-container">
          <h1 className="logo-text">SISLY RESORT</h1>
          <div className="logo-underline"></div>
        </div>

        <p className="tagline">HoşGeldiniz!</p>

        {/* MENU BUTTONS */}
        <div className="menu-buttons">
          <button
            className="menu-button"
            onClick={() => handleNavigation('/restaurant-menu')}
          >
            <span className="button-text">Restoran Menüsü</span>
            <div className="button-glow"></div>
          </button>

          <button
            className="menu-button"
            onClick={() => handleNavigation('/kir-kahvesi-menu')}
          >
            <span className="button-text">Kır Kahvesi Menüsü</span>
            <div className="button-glow"></div>
          </button>

          {/* 🔥 REZERVASYON BUTONU (DÜZGÜN ROTA) */}
          <button
            className="menu-button"
            onClick={() => handleNavigation('/rezervasyon')}
          >
            <span className="button-text">Rezervasyon</span>
            <div className="button-glow"></div>
          </button>
        </div>

        <p className="footer-text">Okut & Sipariş Et Ve Afiyetle Bitir.</p>
      </div>
    </div>
  );
};

export default LandingPage;
