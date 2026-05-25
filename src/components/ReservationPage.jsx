// src/components/ReservationPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

const todayISODate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const ReservationPage = () => {
  const navigate = useNavigate();
  const minDate = useMemo(todayISODate, []);

  const [form, setForm] = useState({
    name: "",
    people: "",
    date: "",
    time: "",
    type: "yemek",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setType = (t) => setForm((p) => ({ ...p, type: t }));

  const setPeople = (delta) =>
    setForm((p) => {
      const current = Number(p.people) || 0;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...p, people: String(next) };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        name: form.name.trim(),
        people: Number(form.people),
        date: form.date,
        time: form.time,
        type: form.type,
        note: form.note.trim() || null,
      };
      await axios.post(`${API_BASE}/reservations`, payload);

      setSuccessMsg(
        "Rezervasyonunuz alındı, en kısa sürede iletişime geçeceğiz. Teşekkür ederiz."
      );
      setForm({
        name: "",
        people: "",
        date: "",
        time: "",
        type: "yemek",
        note: "",
      });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Rezervasyon alınırken bir hata oluştu.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rez-page">
      <div className="rez-bg" />
      <div className="rez-overlay" />

      <button
        type="button"
        className="rez-back"
        onClick={() => navigate("/")}
        aria-label="Ana sayfaya dön"
      >
        ← Ana Sayfa
      </button>

      <div className="rez-wrap">
        <div className="rez-head">
          <h1 className="rez-logo">SISLY RESORT</h1>
          <div className="rez-underline" />
          <p className="rez-tagline">Rezervasyon</p>
          <p className="rez-sub">
            Sizi en güzel şekilde ağırlayabilmemiz için lütfen bilgileri
            doldurun.
          </p>
        </div>

        <form className="rez-card" onSubmit={handleSubmit}>
          {/* Tür seçimi - tabs */}
          <div className="rez-type">
            <button
              type="button"
              className={`rez-type-btn ${
                form.type === "yemek" ? "is-active" : ""
              }`}
              onClick={() => setType("yemek")}
            >
              <span className="rez-type-icon">🍽</span>
              <span className="rez-type-text">Yemek</span>
            </button>
            <button
              type="button"
              className={`rez-type-btn ${
                form.type === "kahvaltı" ? "is-active" : ""
              }`}
              onClick={() => setType("kahvaltı")}
            >
              <span className="rez-type-icon">☕</span>
              <span className="rez-type-text">Kahvaltı</span>
            </button>
          </div>

          {/* İsim */}
          <div className="rez-field">
            <label htmlFor="name" className="rez-label">
              İsim Soyisim
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="rez-input"
              placeholder="Örn: Ahmet Yılmaz"
              autoComplete="name"
            />
          </div>

          {/* Tarih + Saat */}
          <div className="rez-row">
            <div className="rez-field">
              <label htmlFor="date" className="rez-label">
                Tarih
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={minDate}
                required
                className="rez-input"
              />
            </div>
            <div className="rez-field">
              <label htmlFor="time" className="rez-label">
                Saat
              </label>
              <input
                id="time"
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="rez-input"
              />
            </div>
          </div>

          {/* Kişi sayısı stepper */}
          <div className="rez-field">
            <label className="rez-label">Kişi Sayısı</label>
            <div className="rez-stepper">
              <button
                type="button"
                onClick={() => setPeople(-1)}
                className="rez-step-btn"
                aria-label="Azalt"
              >
                −
              </button>
              <input
                type="number"
                name="people"
                value={form.people}
                onChange={handleChange}
                min="1"
                max="50"
                required
                placeholder="2"
                className="rez-step-input"
              />
              <button
                type="button"
                onClick={() => setPeople(1)}
                className="rez-step-btn"
                aria-label="Arttır"
              >
                +
              </button>
            </div>
          </div>

          {/* Not */}
          <div className="rez-field">
            <label htmlFor="note" className="rez-label">
              Not <span className="rez-label-hint">(opsiyonel)</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="rez-textarea"
              placeholder="Doğum günü kutlaması, cam kenarı masa, alerjiler…"
            />
          </div>

          {errorMsg && <div className="rez-alert rez-alert-error">{errorMsg}</div>}
          {successMsg && (
            <div className="rez-alert rez-alert-success">{successMsg}</div>
          )}

          <button type="submit" disabled={loading} className="rez-submit">
            {loading ? (
              <>
                <span className="rez-spinner" /> Gönderiliyor...
              </>
            ) : (
              <>
                <span>Rezervasyon Yap</span>
                <span className="rez-submit-arrow">→</span>
              </>
            )}
          </button>

          <p className="rez-foot">
            Onayınız için sizinle iletişime geçeceğiz.
          </p>
        </form>
      </div>

      <style>{`
        .rez-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 60px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #f5ecd1;
          overflow-x: hidden;
        }
        .rez-bg {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(135deg, #1a3a2e 0%, #0F2A1E 50%, #0a1f16 100%);
        }
        .rez-overlay {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse at top, rgba(214, 196, 142, 0.08), transparent 55%),
            radial-gradient(ellipse at bottom, rgba(214, 196, 142, 0.05), transparent 60%);
          pointer-events: none;
        }
        .rez-back {
          position: fixed;
          top: 22px; left: 22px;
          z-index: 5;
          padding: 9px 16px;
          background: rgba(10, 31, 22, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(214, 196, 142, 0.25);
          border-radius: 10px;
          color: #d6c48e;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .rez-back:hover {
          background: rgba(214, 196, 142, 0.1);
          border-color: rgba(214, 196, 142, 0.5);
          color: #e6d49e;
        }
        .rez-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .rez-head {
          text-align: center;
          margin-bottom: 30px;
          animation: rezFadeDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .rez-logo {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 400;
          color: #d6c48e;
          letter-spacing: 6px;
          margin: 0;
          text-shadow: 0 2px 20px rgba(214, 196, 142, 0.25);
        }
        .rez-underline {
          width: 100px;
          height: 1px;
          margin: 16px auto 14px;
          background: linear-gradient(90deg, transparent, #d6c48e, transparent);
        }
        .rez-tagline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(16px, 2.2vw, 20px);
          color: rgba(214, 196, 142, 0.85);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .rez-sub {
          font-size: 13px;
          color: rgba(245, 236, 209, 0.55);
          letter-spacing: 0.3px;
          line-height: 1.55;
          margin: 0;
        }
        .rez-card {
          width: 100%;
          padding: 32px 28px;
          background: rgba(10, 31, 22, 0.72);
          border: 1px solid rgba(214, 196, 142, 0.2);
          border-radius: 18px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: rezFadeUp 0.8s 0.15s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        /* Tür sekmeleri */
        .rez-type {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 4px;
          background: rgba(10, 31, 22, 0.65);
          border: 1px solid rgba(214, 196, 142, 0.18);
          border-radius: 12px;
        }
        .rez-type-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 14px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9px;
          color: rgba(245, 236, 209, 0.55);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .rez-type-btn:hover { color: #e6d49e; }
        .rez-type-btn.is-active {
          background: linear-gradient(135deg, rgba(214, 196, 142, 0.2), rgba(214, 196, 142, 0.05));
          border-color: rgba(214, 196, 142, 0.4);
          color: #e6d49e;
          box-shadow: inset 0 0 0 1px rgba(214, 196, 142, 0.1);
        }
        .rez-type-icon { font-size: 16px; }
        .rez-type-text { font-family: 'Playfair Display', serif; font-size: 15px; letter-spacing: 1px; }

        /* Form alanları */
        .rez-field { display: flex; flex-direction: column; }
        .rez-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .rez-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(214, 196, 142, 0.7);
          margin-bottom: 8px;
        }
        .rez-label-hint {
          color: rgba(245, 236, 209, 0.35);
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: none;
          margin-left: 4px;
        }
        .rez-input,
        .rez-textarea {
          width: 100%;
          padding: 11px 14px;
          font-family: inherit;
          font-size: 14px;
          color: #f5ecd1;
          background: rgba(10, 31, 22, 0.55);
          border: 1px solid rgba(214, 196, 142, 0.2);
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rez-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
        .rez-input:focus,
        .rez-textarea:focus {
          border-color: rgba(214, 196, 142, 0.55);
          box-shadow: 0 0 0 3px rgba(214, 196, 142, 0.1);
        }
        .rez-input::placeholder,
        .rez-textarea::placeholder { color: rgba(245, 236, 209, 0.3); }
        /* date/time tarayıcı varsayılan ikon rengi */
        .rez-input[type="date"]::-webkit-calendar-picker-indicator,
        .rez-input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.9) sepia(0.4) saturate(2) hue-rotate(15deg);
          opacity: 0.7;
          cursor: pointer;
        }

        /* Kişi sayısı stepper */
        .rez-stepper {
          display: grid;
          grid-template-columns: 48px 1fr 48px;
          gap: 0;
          background: rgba(10, 31, 22, 0.55);
          border: 1px solid rgba(214, 196, 142, 0.2);
          border-radius: 10px;
          overflow: hidden;
        }
        .rez-step-btn {
          background: transparent;
          border: none;
          color: #d6c48e;
          font-size: 22px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .rez-step-btn:hover { background: rgba(214, 196, 142, 0.12); }
        .rez-step-input {
          background: transparent;
          border: none;
          border-left: 1px solid rgba(214, 196, 142, 0.15);
          border-right: 1px solid rgba(214, 196, 142, 0.15);
          padding: 11px 14px;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #f5ecd1;
          text-align: center;
          outline: none;
          /* number input arrows gizle */
          -moz-appearance: textfield;
        }
        .rez-step-input::-webkit-outer-spin-button,
        .rez-step-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Alertler */
        .rez-alert {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid;
          line-height: 1.5;
        }
        .rez-alert-error {
          background: rgba(239, 107, 107, 0.12);
          border-color: rgba(239, 107, 107, 0.35);
          color: #ffb3b3;
        }
        .rez-alert-success {
          background: rgba(110, 231, 183, 0.12);
          border-color: rgba(110, 231, 183, 0.35);
          color: #c6f4dc;
        }

        /* Submit butonu - landing button stiliyle */
        .rez-submit {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 6px;
          padding: 16px 24px;
          background: transparent;
          border: 1.5px solid #d6c48e;
          border-radius: 12px;
          color: #d6c48e;
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .rez-submit::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(214, 196, 142, 0.18), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .rez-submit:hover:not(:disabled) {
          transform: scale(1.02);
          border-color: #e6d49e;
          color: #e6d49e;
          box-shadow: 0 0 30px rgba(214, 196, 142, 0.35), inset 0 0 20px rgba(214, 196, 142, 0.08);
        }
        .rez-submit:hover:not(:disabled)::before { opacity: 1; }
        .rez-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .rez-submit-arrow { transition: transform 0.3s ease; }
        .rez-submit:hover:not(:disabled) .rez-submit-arrow { transform: translateX(4px); }

        .rez-spinner {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid currentColor;
          border-top-color: transparent;
          animation: rezSpin 0.8s linear infinite;
          display: inline-block;
        }

        .rez-foot {
          text-align: center;
          font-size: 11px;
          letter-spacing: 1px;
          color: rgba(245, 236, 209, 0.35);
          margin: 4px 0 0;
        }

        @keyframes rezFadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rezFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rezSpin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
          .rez-page { padding: 70px 14px 40px; }
          .rez-back { top: 14px; left: 14px; padding: 7px 12px; font-size: 12px; }
          .rez-card { padding: 24px 20px; gap: 16px; }
          .rez-logo { letter-spacing: 4px; }
          .rez-row { grid-template-columns: 1fr; gap: 14px; }
        }
      `}</style>
    </div>
  );
};

export default ReservationPage;
