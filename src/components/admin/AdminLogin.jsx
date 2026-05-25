// src/components/admin/AdminLogin.jsx
import React, { useState } from "react";
import "./admin.css";

const ADMIN_TOKEN_KEY = "sisly_admin_authed";
const ADMIN_PASSWORD =
  process.env.REACT_APP_ADMIN_PASSWORD || "sisly123";

export const isAdminAuthed = () =>
  typeof window !== "undefined" &&
  localStorage.getItem(ADMIN_TOKEN_KEY) === "true";

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_TOKEN_KEY, "true");
        setPassword("");
        if (onLogin) onLogin();
      } else {
        setError("Şifre hatalı, tekrar deneyin.");
      }
      setBusy(false);
    }, 320);
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <div className="admin-login-logo">SISLY RESORT</div>
        <div className="admin-login-underline" />
        <div className="admin-login-sub">Yönetim Girişi</div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div>
            <label className="admin-field-label">Admin Şifresi</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="admin-btn admin-btn-primary"
            style={{ width: "100%", padding: "12px 16px", marginTop: 6 }}
          >
            {busy ? (
              <>
                <span className="admin-spinner" /> Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        <p className="admin-login-hint">
          Şifreyi unuttuysanız veya değiştirmek istiyorsanız geliştirici ile
          iletişime geçin.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
