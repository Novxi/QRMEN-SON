// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-main">
          © {year} Sisly Resort. Tüm hakları saklıdır.
        </p>
        <p className="footer-sub">
          Okut &amp; Sipariş Et Ve Afiyetle Bitir.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
