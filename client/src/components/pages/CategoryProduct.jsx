//src/components/pages/CategoryProduct.jsx

import React, { useState, useEffect } from "react";
import Layout from "../../components/pages/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/cart";
import { toast } from "react-toastify";
import "./CategoryProduct.css";

const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔴 নতুন স্টেট: মোবাইল ফিল্টার মেনু এবং সর্টিংয়ের জন্য
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    if (params?.slug) getProductsByCat();
  }, [params?.slug]);

  const getProductsByCat = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/v1/product/product-category/${params.slug}`,
      );
      setProducts(data?.products);
      setCategory(data?.category);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleFilter = () => {
    toast.info("Filtering functionality will be connected soon!");
    setIsFilterOpen(false); // মোবাইলে অ্যাপ্লাই করার পর মেনু বন্ধ হয়ে যাবে
  };

  // 🔴 প্রোডাক্ট সর্টিং লজিক (দাম অনুযায়ী সাজানো)
  const sortedProducts = [...products].sort((a, b) => {
    // সঠিক দাম বের করা (ডিসকাউন্ট থাকলে সেটা, নাহলে রেগুলার দাম)
    const priceA =
      a.discountPrice > 0 && a.discountPrice < a.price
        ? a.discountPrice
        : a.price;
    const priceB =
      b.discountPrice > 0 && b.discountPrice < b.price
        ? b.discountPrice
        : b.price;

    if (sortOrder === "price-asc") return priceA - priceB; // Low to High
    if (sortOrder === "price-desc") return priceB - priceA; // High to Low
    return 0; // Default
  });

  return (
    <Layout title={`${category?.name || "Category"} - RupomiqBd`}>
      <div className="category-page-container">
        {/* Page Header */}
        <div className="category-banner">
          <h1>{category?.name}</h1>
          <p>{products?.length} Products found in this category</p>
        </div>

        <div className="category-main-content">
          {/* 🔴 মোবাইল ফিল্টার ওভারলে (ব্যাকগ্রাউন্ড কালো করার জন্য) */}
          {isFilterOpen && (
            <div
              className="filter-overlay"
              onClick={() => setIsFilterOpen(false)}
            ></div>
          )}

          {/* Left Sidebar (Filters) */}
          <div className={`filter-sidebar ${isFilterOpen ? "open" : ""}`}>
            <div className="filter-header-mobile">
              <h4>Filters</h4>
              <button
                className="close-filter-btn"
                onClick={() => setIsFilterOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="filter-group">
              <h5>Price Range</h5>
              <div className="price-inputs">
                <input type="number" placeholder="Min" />
                <span>-</span>
                <input type="number" placeholder="Max" />
              </div>
              <button className="apply-filter-btn" onClick={handleFilter}>
                Apply
              </button>
            </div>

            <div className="filter-group">
              <h5>Availability</h5>
              <label className="checkbox-label">
                <input type="checkbox" /> In Stock
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Pre-Order
              </label>
            </div>
          </div>

          {/* Right Side (Product Grid & Top Bar) */}
          <div className="products-grid-area">
            {/* 🔴 Top Action Bar (Mobile Filter Btn & Sort Dropdown) */}
            <div className="products-top-bar">
              <button
                className="mobile-filter-toggle"
                onClick={() => setIsFilterOpen(true)}
              >
                <i className="fa-solid fa-filter"></i> Filter
              </button>

              <div className="sort-box">
                <label>Sort By:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Default Sorting</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <h4 className="text-center w-100 mt-5">Loading Products...</h4>
            ) : (
              <div className="modern-product-grid">
                {/* 🔴 products এর বদলে sortedProducts ম্যাপ করা হয়েছে */}
                {sortedProducts?.map((p) => {
                  const isDiscounted =
                    p.discountPrice > 0 && p.discountPrice < p.price;
                  const discountPercentage = isDiscounted
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                    : 0;

                  return (
                    <div className="modern-card" key={p._id}>
                      {isDiscounted && (
                        <span className="discount-ribbon">
                          {discountPercentage}%<br />
                          OFF
                        </span>
                      )}

                      <div
                        className="card-img-wrapper"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        <img
                          src={`/api/v1/product/product-photo/${p._id}`}
                          alt={p.name}
                        />
                      </div>

                      <div className="card-info">
                        <h5
                          className="product-title"
                          onClick={() => navigate(`/product/${p.slug}`)}
                        >
                          {p.name.substring(0, 45)}
                          {p.name.length > 45 && "..."}
                        </h5>

                        <div className="product-card-rating">
                          {p.reviews && p.reviews.length > 0 && (
                            <>
                              <div className="stars">
                                {[...Array(5)].map((_, index) => (
                                  <i
                                    key={index}
                                    className={
                                      index < Math.round(p.rating || 5)
                                        ? "fa-solid fa-star"
                                        : "fa-regular fa-star"
                                    }
                                  ></i>
                                ))}
                              </div>
                              <span className="review-count">
                                ({p.reviews.length})
                              </span>
                            </>
                          )}
                        </div>

                        <div className="price-row">
                          {isDiscounted ? (
                            <>
                              <span className="current-price">
                                ৳ {p.discountPrice}
                              </span>
                              <del className="old-price">৳ {p.price}</del>
                            </>
                          ) : (
                            <span className="current-price">৳ {p.price}</span>
                          )}
                        </div>

                        {/* ============ ডাইনামিক বাটন লজিক ============ */}
                        {p.variants && p.variants.length > 0 ? (
                          <button
                            className="add-cart-btn"
                            style={{
                              backgroundColor: "#0f172a",
                            }} /* সিলেক্ট অপশন বাটনের কালার একটু আলাদা বোঝানোর জন্য ডার্ক করা হলো */
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${p.slug}`); // ভ্যারিয়েন্ট থাকলে ডিটেইলস পেজে নিয়ে যাবে
                            }}
                          >
                            Select Options
                          </button>
                        ) : (
                          <button
                            className="add-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCart([...cart, p]);
                              localStorage.setItem(
                                "cart",
                                JSON.stringify([...cart, p]),
                              );
                              toast.success("Item Added to cart");
                            }}
                          >
                            <i className="fa-solid fa-cart-shopping"></i> Add To
                            Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProduct;
