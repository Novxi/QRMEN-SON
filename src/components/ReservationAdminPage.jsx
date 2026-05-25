// src/components/ReservationAdminPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import AdminLayout from "./admin/AdminLayout";
import AdminLogin, { isAdminAuthed } from "./admin/AdminLogin";
import "./admin/admin.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

// ---------- yardımcılar ----------
const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseResDate = (r) => {
  // 'YYYY-MM-DD' beklenir; bozuksa null
  if (!r?.date) return null;
  const [y, m, d] = r.date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const fmtDateLong = (iso) => {
  const d = parseResDate({ date: iso });
  if (!d) return iso;
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
};

const fmtCreated = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso).slice(0, 16);
  }
};

const FILTERS = [
  { key: "today", label: "Bugün" },
  { key: "upcoming", label: "Yaklaşan" },
  { key: "past", label: "Geçmiş" },
  { key: "all", label: "Tümü" },
];

const ReservationAdminPage = () => {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("today");
  const [search, setSearch] = useState("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/reservations`);
      setReservations(res.data || []);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Rezervasyonlar alınırken bir hata oluştu.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchReservations();
    else setLoading(false);
  }, [authed]);

  // ---------- türetilmiş ----------
  const today = useMemo(() => todayISO(), []);
  const weekEnd = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const enriched = useMemo(() => {
    return reservations.map((r) => {
      const d = parseResDate(r);
      let bucket = "past";
      if (d) {
        const t = d.getTime();
        if (t === today.getTime()) bucket = "today";
        else if (t > today.getTime()) bucket = "upcoming";
      }
      return { ...r, _date: d, _bucket: bucket };
    });
  }, [reservations, today]);

  const stats = useMemo(() => {
    const todayCount = enriched.filter((r) => r._bucket === "today").length;
    const weekCount = enriched.filter(
      (r) => r._date && r._date >= today && r._date <= weekEnd
    ).length;
    const upcomingCount = enriched.filter(
      (r) => r._bucket === "upcoming" || r._bucket === "today"
    ).length;
    return {
      total: enriched.length,
      today: todayCount,
      week: weekCount,
      upcoming: upcomingCount,
    };
  }, [enriched, today, weekEnd]);

  const visible = useMemo(() => {
    let list = enriched;
    if (filter !== "all") list = list.filter((r) => r._bucket === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.note || "").toLowerCase().includes(q) ||
          (r.type || "").toLowerCase().includes(q)
      );
    }
    // tarih + saate göre sırala (yakın olan önce)
    return [...list].sort((a, b) => {
      const ad = a._date ? a._date.getTime() : 0;
      const bd = b._date ? b._date.getTime() : 0;
      if (ad !== bd) return ad - bd;
      return String(a.time || "").localeCompare(String(b.time || ""));
    });
  }, [enriched, filter, search]);

  const navCounts = useMemo(
    () => ({ "/admin/reservations": stats.upcoming }),
    [stats.upcoming]
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bu rezervasyonu silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`${API_BASE}/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Silinirken bir hata oluştu.");
    }
  };

  // ---------- render ----------
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  if (loading) {
    return (
      <div className="admin-loader">
        <span className="admin-spinner" />
        <span style={{ marginLeft: 12 }}>Rezervasyonlar Yükleniyor</span>
      </div>
    );
  }

  const headerActions = (
    <button
      type="button"
      className="admin-btn admin-btn-primary"
      onClick={fetchReservations}
      disabled={loading}
    >
      {loading ? <><span className="admin-spinner" /> Yenileniyor</> : "Yenile"}
    </button>
  );

  return (
    <AdminLayout
      title="Rezervasyonlar"
      subtitle="Kim, kaç kişi, hangi gün ve saatte gelecek — buradan takip edebilirsin."
      actions={headerActions}
      navCounts={navCounts}
    >
      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* İstatistik kartları */}
      <div className="res-stats">
        <StatCard label="Bugün" value={stats.today} highlight />
        <StatCard label="Yaklaşan" value={stats.upcoming} />
        <StatCard label="Bu Hafta" value={stats.week} />
        <StatCard label="Toplam" value={stats.total} />
      </div>

      {/* Filtre + arama */}
      <div className="res-toolbar">
        <div className="admin-segment">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? "is-active" : ""}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="admin-search" style={{ flex: 1, minWidth: 220 }}>
          <span className="admin-search-icon">⌕</span>
          <input
            className="admin-input"
            placeholder="İsim, tür veya not ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste */}
      {visible.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📭</div>
          <div className="admin-empty-title">
            {search
              ? "Eşleşen rezervasyon yok"
              : filter === "today"
              ? "Bugün için rezervasyon yok"
              : "Bu filtrede rezervasyon yok"}
          </div>
        </div>
      ) : (
        <div className="res-list">
          {visible.map((r) => (
            <ReservationCard
              key={r.id}
              res={r}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}

      <style>{`
        .res-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        .res-stat {
          padding: 18px 20px;
          background: var(--admin-surface);
          border: 1px solid var(--admin-gold-faint);
          border-radius: 14px;
        }
        .res-stat.is-highlight {
          background: linear-gradient(135deg, rgba(214, 196, 142, 0.16), rgba(214, 196, 142, 0.04));
          border-color: rgba(214, 196, 142, 0.35);
        }
        .res-stat-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--admin-text-dim);
          margin-bottom: 8px;
        }
        .res-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 600;
          color: var(--admin-gold);
          line-height: 1;
        }
        .res-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
        }
        .res-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .res-card {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 16px 18px;
          background: var(--admin-surface-3);
          border: 1px solid var(--admin-gold-faint);
          border-radius: 14px;
          transition: border-color 0.2s ease;
        }
        .res-card:hover { border-color: var(--admin-gold-muted); }
        .res-card.is-today {
          background: linear-gradient(135deg, rgba(214, 196, 142, 0.12), rgba(214, 196, 142, 0.02));
          border-color: rgba(214, 196, 142, 0.35);
        }
        .res-card.is-past { opacity: 0.62; }
        .res-date-block {
          text-align: center;
          padding: 6px 10px;
          border-right: 1px solid var(--admin-gold-faint);
        }
        .res-date-day {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--admin-gold);
          line-height: 1;
        }
        .res-date-mo {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--admin-text-muted);
          margin-top: 4px;
        }
        .res-date-time {
          font-size: 13px;
          color: var(--admin-gold-bright);
          font-weight: 600;
          margin-top: 6px;
          font-variant-numeric: tabular-nums;
        }
        .res-info-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: var(--admin-text);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .res-info-meta {
          font-size: 12px;
          color: var(--admin-text-muted);
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .res-info-meta .dot::before { content: "•"; margin-right: 12px; color: var(--admin-text-dim); }
        .res-info-note {
          font-size: 12px;
          color: var(--admin-text-muted);
          margin-top: 8px;
          padding: 8px 10px;
          border-left: 2px solid var(--admin-gold-faint);
          background: rgba(214, 196, 142, 0.04);
          border-radius: 0 8px 8px 0;
        }
        .res-info-created {
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--admin-text-dim);
          margin-top: 8px;
        }
        .res-type-pill {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(214, 196, 142, 0.1);
          border: 1px solid var(--admin-gold-faint);
          color: var(--admin-gold);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: capitalize;
        }
        .res-people-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: var(--admin-text);
        }

        @media (max-width: 880px) {
          .res-stats { grid-template-columns: repeat(2, 1fr); }
          .res-card { grid-template-columns: 80px 1fr; }
          .res-card > .res-actions {
            grid-column: 1 / -1;
            justify-self: end;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div className={`res-stat ${highlight ? "is-highlight" : ""}`}>
    <div className="res-stat-label">{label}</div>
    <div className="res-stat-value">{value}</div>
  </div>
);

const ReservationCard = ({ res, onDelete }) => {
  const d = res._date;
  const dayNum = d ? d.getDate() : "—";
  const moStr = d
    ? d.toLocaleDateString("tr-TR", { month: "short" }).replace(".", "")
    : "";
  const cardClass = `res-card ${
    res._bucket === "today" ? "is-today" : ""
  } ${res._bucket === "past" ? "is-past" : ""}`;

  return (
    <div className={cardClass}>
      <div className="res-date-block">
        <div className="res-date-day">{dayNum}</div>
        <div className="res-date-mo">{moStr}</div>
        <div className="res-date-time">{res.time || "--:--"}</div>
      </div>

      <div>
        <div className="res-info-name">{res.name || "—"}</div>
        <div className="res-info-meta">
          <span className="res-people-pill">👥 {res.people} kişi</span>
          <span className="dot">
            <span className="res-type-pill">{res.type || "yemek"}</span>
          </span>
          {d && <span className="dot">{fmtDateLong(res.date)}</span>}
        </div>
        {res.note && <div className="res-info-note">“{res.note}”</div>}
        {res.created_at && (
          <div className="res-info-created">
            Alındı: {fmtCreated(res.created_at)}
          </div>
        )}
      </div>

      <div className="res-actions">
        <button
          type="button"
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={onDelete}
        >
          Sil
        </button>
      </div>
    </div>
  );
};

export default ReservationAdminPage;
