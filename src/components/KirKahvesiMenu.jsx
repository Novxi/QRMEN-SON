// src/components/KirKahvesiMenu.jsx
import React from "react";
import { kirKahvesiMenu as menuData } from "../mock"; // 🔹 ÖNEMLİ: BURASI DÜZELTİLDİ
import MenuCategory from "./MenuCategory";

// Yalnızca göstermek istediğin kategoriler:
const allowedCategories = ["Sıcak İçecekler", "Soğuk İçecekler", "Tatlılar", "Fast Food"];

const KirKahvesiMenu = () => {
  const categories = Array.isArray(menuData?.categories) ? menuData.categories : [];

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Kır Kahvesi Menüsü
      </h1>

      {categories
        .filter((cat) => allowedCategories.includes(cat?.name))
        .map((cat) => (
          <MenuCategory key={cat.id ?? cat.name} category={cat} />
        ))}
    </div>
  );
};

export default KirKahvesiMenu;
