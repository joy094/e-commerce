import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HomeCategoryIcons.css";

const HomeCategoryIcons = () => {
  const [categories, setCategories] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const { data } = await axios.get("/api/v1/category/get-category");
        if (data?.success) {
          setCategories(data.category);
        }
      } catch (error) {
        console.log("Error fetching categories", error);
      }
    };
    getCategories();
  }, []);

  // মোবাইলে অ্যারো বাটনে ক্লিক করলে ডানদিকে একটু স্ক্রল হবে
  const handleScrollRight = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  return (
    <div className="home-category-wrapper">
      <div className="category-scroll-container">
        <div className="category-icon-grid" ref={gridRef}>
          {categories.map((c) => (
            <Link
              to={`/category/${c.slug}`}
              key={c._id}
              className="category-icon-card"
            >
              <div className="icon-box">
                {c.icon && c.icon.startsWith("http") ? (
                  <img
                    src={c.icon}
                    alt={c.name}
                    style={{
                      width: "35px",
                      height: "35px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <i className={c.icon || "fa-solid fa-folder"}></i>
                )}
              </div>
              <span className="category-name">{c.name}</span>
            </Link>
          ))}
        </div>

        {/* 🔴 মোবাইলের জন্য স্ক্রল অ্যারো ইন্ডিকেটর */}
        <button
          className="mobile-scroll-arrow"
          onClick={handleScrollRight}
          aria-label="Scroll right"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default HomeCategoryIcons;
