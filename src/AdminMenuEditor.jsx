// src/AdminMenuEditor.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin, { isAdminAuthed } from "./components/admin/AdminLogin";
import "./components/admin/admin.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

// ---------- yardımcı: yeni ürün için id üret ----------
const generateItemId = (categoryId, items) => {
  const prefix = (categoryId || "x")[0];
  const nums = items
    .map((it) => {
      const m = String(it.id || "").match(/[a-zA-Z]+(\d+)/);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n) => n !== null);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${next}`;
};

const emptyItem = (id) => ({
  id,
  name: "",
  description: "",
  price: 0,
  image: "",
  badges: [],
  chefRec: false,
});

const AdminMenuEditor = () => {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const [selectedLang, setSelectedLang] = useState("tr");
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [search, setSearch] = useState("");

  // ---------- veri çek ----------
  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE}/menu`);
        setMenu(res.data);
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          err.message ||
          "Menü verisi alınırken bir hata oluştu.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [authed]);

  // ---------- türetilmiş veriler ----------
  const langKeys = useMemo(() => (menu ? Object.keys(menu) : []), [menu]);
  const currentLang =
    menu && selectedLang in menu ? selectedLang : langKeys[0];
  const currentCategories = useMemo(
    () => (menu && currentLang ? menu[currentLang]?.categories || [] : []),
    [menu, currentLang]
  );
  const activeCategory =
    currentCategories[selectedCatIdx] || currentCategories[0] || null;

  const filteredItems = useMemo(() => {
    if (!activeCategory) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activeCategory.items.map((it, idx) => ({ it, idx }));
    return activeCategory.items
      .map((it, idx) => ({ it, idx }))
      .filter(({ it }) => {
        return (
          (it.name || "").toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q) ||
          String(it.id || "").toLowerCase().includes(q)
        );
      });
  }, [activeCategory, search]);

  // Sidebar için sayım
  const navCounts = useMemo(() => {
    return {
      "/admin": currentCategories.reduce(
        (acc, c) => acc + (c.items?.length || 0),
        0
      ),
    };
  }, [currentCategories]);

  // ---------- mutasyonlar ----------
  const handleItemChange = (catIndex, itemIndex, field, value) => {
    setMenu((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const item = copy[currentLang].categories[catIndex].items[itemIndex];
      if (field === "price") item[field] = Number(value) || 0;
      else if (field === "badges") {
        item[field] = value
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean);
      } else if (field === "chefRec") item[field] = !!value;
      else item[field] = value;
      return copy;
    });
  };

  const addNewItem = (catIndex) => {
    setMenu((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const category = copy[currentLang].categories[catIndex];
      const newId = generateItemId(category.id, category.items);
      category.items.push(emptyItem(newId));
      return copy;
    });
    // Yeni ürün arama filtresine düşmesin
    setSearch("");
  };

  const deleteItem = (catIndex, itemIndex) => {
    if (!window.confirm("Bu ürünü silmek istediğine emin misin?")) return;
    setMenu((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy[currentLang].categories[catIndex].items.splice(itemIndex, 1);
      return copy;
    });
  };

  const saveChanges = async () => {
    if (!menu) return;
    try {
      setSaving(true);
      setError("");
      await axios.put(`${API_BASE}/menu`, menu);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Kaydederken bir hata oluştu.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---------- render ----------
  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  if (loading) {
    return (
      <div className="admin-loader">
        <span className="admin-spinner" />
        <span style={{ marginLeft: 12 }}>Menü Yükleniyor</span>
      </div>
    );
  }

  if (error && !menu) {
    return (
      <AdminLayout title="Menü Yönetimi">
        <div className="admin-alert admin-alert-error">{error}</div>
      </AdminLayout>
    );
  }

  if (!menu) {
    return (
      <AdminLayout title="Menü Yönetimi">
        <div className="admin-empty">
          <div className="admin-empty-icon">🍽</div>
          <div className="admin-empty-title">Menü bulunamadı</div>
        </div>
      </AdminLayout>
    );
  }

  const headerActions = (
    <>
      <div className="admin-segment" role="tablist" aria-label="Dil">
        {langKeys.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLang(l)}
            className={currentLang === l ? "is-active" : ""}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="admin-btn admin-btn-primary"
        onClick={saveChanges}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="admin-spinner" /> Kaydediliyor
          </>
        ) : savedFlash ? (
          <>✓ Kaydedildi</>
        ) : (
          <>Değişiklikleri Kaydet</>
        )}
      </button>
    </>
  );

  return (
    <AdminLayout
      title="Menü Yönetimi"
      subtitle="Ürün isimlerini, fiyatlarını, açıklamalarını ve görsellerini bu panelden düzenleyebilirsin."
      actions={headerActions}
      navCounts={navCounts}
    >
      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div className="menu-editor-grid">
        {/* Kategori sütunu */}
        <div className="menu-editor-cats">
          <div className="admin-sidebar-label" style={{ padding: "0 4px 10px" }}>
            Kategoriler
          </div>
          <div className="menu-cat-list">
            {currentCategories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCatIdx(idx);
                  setSearch("");
                }}
                className={`menu-cat-btn ${
                  selectedCatIdx === idx ? "is-active" : ""
                }`}
              >
                <span className="menu-cat-name">{cat.name}</span>
                <span className="admin-nav-count">{cat.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seçili kategori — ürünler */}
        <div className="menu-editor-main">
          {activeCategory ? (
            <>
              <div className="menu-cat-head">
                <div>
                  <div className="menu-cat-head-title">
                    {activeCategory.name}
                    <span className="menu-cat-head-id">#{activeCategory.id}</span>
                  </div>
                  {activeCategory.subtitle && (
                    <div className="menu-cat-head-sub">
                      {activeCategory.subtitle}
                    </div>
                  )}
                </div>
                <button
                  className="admin-btn admin-btn-ghost"
                  onClick={() => addNewItem(selectedCatIdx)}
                >
                  + Yeni Ürün
                </button>
              </div>

              <div className="admin-search" style={{ marginBottom: 18 }}>
                <span className="admin-search-icon">⌕</span>
                <input
                  className="admin-input"
                  placeholder={`${activeCategory.name} içinde ara…`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">🍃</div>
                  <div className="admin-empty-title">
                    {search ? "Eşleşen ürün yok" : "Bu kategoride ürün yok"}
                  </div>
                  {!search && (
                    <button
                      className="admin-btn admin-btn-primary"
                      style={{ marginTop: 14 }}
                      onClick={() => addNewItem(selectedCatIdx)}
                    >
                      + İlk Ürünü Ekle
                    </button>
                  )}
                </div>
              ) : (
                <div className="menu-item-list">
                  {filteredItems.map(({ it: item, idx: iIdx }) => (
                    <ItemCard
                      key={item.id + "_" + iIdx}
                      item={item}
                      onChange={(field, value) =>
                        handleItemChange(selectedCatIdx, iIdx, field, value)
                      }
                      onDelete={() => deleteItem(selectedCatIdx, iIdx)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">🍽</div>
              <div className="admin-empty-title">Kategori seçili değil</div>
            </div>
          )}
        </div>
      </div>

      {/* Editor stilleri — sadece bu sayfa */}
      <style>{`
        .menu-editor-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 22px;
        }
        .menu-editor-cats {
          position: sticky;
          top: 90px;
          align-self: start;
        }
        .menu-cat-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .menu-cat-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 10px;
          color: var(--admin-text-muted);
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .menu-cat-btn:hover { background: var(--admin-gold-ghost); color: var(--admin-gold-bright); }
        .menu-cat-btn.is-active {
          background: linear-gradient(135deg, rgba(214, 196, 142, 0.16), rgba(214, 196, 142, 0.04));
          border-color: var(--admin-gold-faint);
          color: var(--admin-gold);
        }
        .menu-cat-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .menu-cat-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--admin-gold-faint);
          flex-wrap: wrap;
        }
        .menu-cat-head-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: var(--admin-gold);
          letter-spacing: 1px;
        }
        .menu-cat-head-id {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--admin-text-dim);
          margin-left: 10px;
          letter-spacing: 1px;
        }
        .menu-cat-head-sub {
          font-size: 12px;
          color: var(--admin-text-muted);
          margin-top: 4px;
        }
        .menu-item-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .menu-item-card {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 16px;
          padding: 16px;
          background: var(--admin-surface-3);
          border: 1px solid var(--admin-gold-faint);
          border-radius: 14px;
          transition: border-color 0.2s ease;
        }
        .menu-item-card:hover { border-color: var(--admin-gold-muted); }
        .menu-item-thumb {
          width: 96px; height: 96px;
          border-radius: 12px;
          border: 1px solid var(--admin-gold-faint);
          background: rgba(10, 31, 22, 0.6);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-dim);
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .menu-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .menu-item-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .menu-item-row {
          display: grid;
          grid-template-columns: 1fr 120px;
          gap: 10px;
        }
        .menu-item-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .menu-item-id {
          font-family: 'Inter', monospace;
          font-size: 10px;
          color: var(--admin-text-dim);
          letter-spacing: 1px;
        }
        .menu-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-top: 6px;
          border-top: 1px dashed var(--admin-gold-faint);
        }
        .menu-item-chef {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--admin-text-muted);
          cursor: pointer;
          user-select: none;
        }
        .menu-item-chef input { accent-color: var(--admin-gold); }

        @media (max-width: 880px) {
          .menu-editor-grid { grid-template-columns: 1fr; }
          .menu-editor-cats { position: static; }
          .menu-cat-list { flex-direction: row; overflow-x: auto; padding-bottom: 8px; }
          .menu-cat-btn { white-space: nowrap; }
          .menu-item-card { grid-template-columns: 72px 1fr; }
          .menu-item-thumb { width: 72px; height: 72px; }
          .menu-item-row { grid-template-columns: 1fr; }
          .menu-item-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminLayout>
  );
};

// ---------- Ürün kartı ----------
const ItemCard = ({ item, onChange, onDelete }) => {
  const [showImageField, setShowImageField] = useState(false);

  return (
    <div className="menu-item-card">
      <div
        className="menu-item-thumb"
        onClick={() => setShowImageField((v) => !v)}
        title="Görsel yolu için tıkla"
        style={{ cursor: "pointer" }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name || ""}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span>Görsel</span>
        )}
      </div>

      <div className="menu-item-body">
        <div className="menu-item-row">
          <div>
            <label className="admin-field-label">Ürün Adı</label>
            <input
              className="admin-input"
              value={item.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Ürün adı"
            />
          </div>
          <div>
            <label className="admin-field-label">Fiyat (₺)</label>
            <input
              type="number"
              className="admin-input"
              value={item.price ?? ""}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="admin-field-label">Açıklama</label>
          <textarea
            className="admin-textarea"
            value={item.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Kısa açıklama"
          />
        </div>

        <div className="menu-item-row-3">
          <div>
            <label className="admin-field-label">
              Rozetler (virgülle ayır)
            </label>
            <input
              className="admin-input"
              value={(item.badges || []).join(", ")}
              onChange={(e) => onChange("badges", e.target.value)}
              placeholder="örn: vegan, glutensiz"
            />
          </div>
          {showImageField && (
            <div>
              <label className="admin-field-label">Görsel Yolu</label>
              <input
                className="admin-input"
                value={item.image || ""}
                onChange={(e) => onChange("image", e.target.value)}
                placeholder="/images/... .webp"
              />
            </div>
          )}
        </div>

        <div className="menu-item-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="menu-item-id">ID: {item.id}</span>
            <label className="menu-item-chef">
              <input
                type="checkbox"
                checked={!!item.chefRec}
                onChange={(e) => onChange("chefRec", e.target.checked)}
              />
              Şefin Önerisi
            </label>
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => setShowImageField((v) => !v)}
            >
              {showImageField ? "Görsel Alanını Gizle" : "Görsel Düzenle"}
            </button>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-danger admin-btn-sm"
            onClick={onDelete}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMenuEditor;
