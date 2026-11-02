// CategorySection.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🔴 useNavigate ইমপোর্ট করা হলো
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useCart } from "../../context/cart"; // 🔴 Cart context ইমপোর্ট করা হলো
import { toast } from "react-toastify"; // 🔴 Toast ইমপোর্ট করা হলো

import "swiper/css";
import "swiper/css/navigation";
import "./CategorySection.css";

const CategorySection = ({ title, slug }) => {
  const navigate = useNavigate(); // 🔴 navigate হুক
  const [cart, setCart] = useCart(); // 🔴 cart হুক

  const [products, setProducts] = useState(() => {
    const savedData = localStorage.getItem(`cache_${slug}`);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [loading, setLoading] = useState(() => {
    return localStorage.getItem(`cache_${slug}`) ? false : true;
  });

  useEffect(() => {
    const getProductsByCat = async () => {
      try {
        if (products.length === 0) setLoading(true);

        const { data } = await axios.get(
          `/api/v1/product/product-category/${slug}`,
        );
        if (data?.success) {
          const fetchedProducts = data?.products.slice(0, 12);
          setProducts(fetchedProducts);

          localStorage.setItem(
            `cache_${slug}`,
            JSON.stringify(fetchedProducts),
          );
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      getProductsByCat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <div className="category-section">
      <div className="section-header">
        <h4 className="section-title">{title}</h4>
        {!loading && (
          <Link to={`/category/${slug}`} className="see-all-button">
            See All <i className="fa-solid fa-chevron-right"></i>
          </Link>
        )}
      </div>

      <div className="product-slider-wrapper">
        <Swiper
          slidesPerView={2}
          spaceBetween={10}
          navigation={!loading}
          slidesPerGroup={1}
          modules={[Navigation]}
          className="productSwiper"
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            576: { slidesPerView: 2.5, spaceBetween: 15 },
            768: { slidesPerView: 3.5, spaceBetween: 20 },
            992: { slidesPerView: 4.5, spaceBetween: 20 },
            1200: { slidesPerView: 5, spaceBetween: 25 },
          }}
        >
          {loading
            ? [1, 2, 3, 4, 5].map((n) => (
                <SwiperSlide key={n}>
                  <div className="product-card skeleton-card">
                    <div className="product-img-wrapper skeleton-box"></div>
                    <div className="product-info">
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line price"></div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            : products.map((p) => (
                <SwiperSlide key={p._id}>
                  <Link
                    to={`/product/${p.slug}`}
                    className="product-card-link"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="product-card" style={{ height: "100%" }}>
                      {" "}
                      {/* 🔴 কার্ডের উচ্চতা সমান রাখার জন্য */}
                      <div className="product-img-wrapper">
                        {/* ============ ১. Arogga স্টাইল ডিসকাউন্ট রিবন ============ */}
                        {p.discountPrice > 0 && p.discountPrice < p.price && (
                          <div className="arogga-discount-badge">
                            <span className="percent">
                              {Math.round(
                                ((p.price - p.discountPrice) / p.price) * 100,
                              )}
                              %
                            </span>
                            <span className="off-text">OFF</span>
                          </div>
                        )}
                        <img
                          src={`/api/v1/product/product-photo/${p._id}`}
                          alt={p.name}
                        />{" "}
                        {/* 🔴 ছবি API থেকে আনার ব্যবস্থা করা হলো, আগে সরাসরি p.photo ছিল */}
                      </div>
                      <div className="product-info">
                        <h5 className="product-name">
                          {p.name.substring(0, 40)}
                          {p.name.length > 40 ? "..." : ""}
                        </h5>

                        {/* ============ ২. প্রাইস সেকশন ============ */}
                        <div className="price-container">
                          {p.discountPrice > 0 && p.discountPrice < p.price ? (
                            <>
                              <span className="original-price-strike">
                                ৳ {p.price}
                              </span>
                              <span className="price-tag">
                                ৳ {p.discountPrice}
                              </span>
                            </>
                          ) : (
                            <span className="price-tag">৳ {p.price}</span>
                          )}

                          {/* রেটিং কন্টেইনার */}
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
                        </div>

                        {/* ============ ৩. ডাইনামিক বাটন লজিক ============ */}
                        {p.variants && p.variants.length > 0 ? (
                          <button
                            className="add-to-cart-btn"
                            style={{
                              backgroundColor: "#0f172a",
                              borderColor: "#0f172a",
                              color: "#fff",
                            }} /* 🔴 Select Options বাটন ডার্ক করা হলো */
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/product/${p.slug}`);
                            }}
                          >
                            Select Options
                          </button>
                        ) : (
                          <button
                            className="add-to-cart-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // 🔴 আসল Add to Cart লজিক বসানো হলো
                              setCart([...cart, p]);
                              localStorage.setItem(
                                "cart",
                                JSON.stringify([...cart, p]),
                              );
                              toast.success("Item Added to cart");
                            }}
                          >
                            <i className="fa-solid fa-cart-shopping"></i> Add to
                            Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategorySection;
