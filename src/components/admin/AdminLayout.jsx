// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./admin.css";

const ADMIN_TOKEN_KEY = "sisly_admin_authed";

const NAV = [
  { to: "/admin", icon: "🍽", label: "Menü Yönetimi", end: true },
  { to: "/admin/reservations", icon: "📅", label: "Rezervasyonlar" },
];

const AdminLayout = ({
  title,
  subtitle,
  actions = null,
  navCounts = {},
  children,
}) => {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin");
    window.location.reload();
  };

  return (
    <div className="admin-root">
      <header className="admin-topbar">
        <button
          className="admin-mobile-toggle"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
        >
          {mobileNavOpen ? "✕" : "☰"}
        </button>

        <div className="admin-topbar-brand">
          <div className="admin-brand-mark">S</div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">Sisly Resort</span>
            <span className="admin-brand-sub">Yönetim Paneli</span>
          </div>
        </div>

        <div className="admin-topbar-spacer" />

        <div className="admin-topbar-actions">
          <a
            href="/"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            title="Siteye dön"
          >
            ↗ Siteyi Aç
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={handleLogout}
          >
            Çıkış
          </button>
        </div>
      </header>

      <div className="admin-shell">
        <aside className={`admin-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
          <div className="admin-sidebar-label">Bölümler</div>

          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "is-active" : ""}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {typeof navCounts[item.to] === "number" && (
                <span className="admin-nav-count">{navCounts[item.to]}</span>
              )}
            </NavLink>
          ))}

          <div className="admin-sidebar-footer">
            Sisly Resort • Admin
          </div>
        </aside>

        <main className="admin-content">
          {(title || actions) && (
            <div className="admin-page-head">
              <div>
                {title && <h1 className="admin-page-title">{title}</h1>}
                {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
              </div>
              {actions && <div className="admin-page-actions">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
