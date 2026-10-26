// src/components/pages/ProductDetails.jsx

import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";
import SimilarProducts from "./SimilarProducts";
import "./ProductDetails.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [auth] = useAuth();
  const [product, setProduct] = useState({});
  const [cart, setCart] = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const contactNumber = "+8801728355302";

  // 🔴 YouTube Video ID বের করার ফাংশন
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`,
      );
      setProduct(data?.product);
      setMainImage(data?.product?.photo);

      if (data?.product?._id && data?.product?.category?._id) {
        getSimilarProduct(data?.product._id, data?.product.category._id);
      }

      if (data?.product?.variants?.length > 0) {
        const defaultVariant = data.product.variants[0];
        setSelectedVariant(defaultVariant);

        if (
          defaultVariant.photoIndex !== undefined &&
          defaultVariant.photoIndex !== null &&
          defaultVariant.photoIndex !== ""
        ) {
          const pIdx = Number(defaultVariant.photoIndex);
          if (data.product.extraPhotos?.[pIdx]) {
            setMainImage(data.product.extraPhotos[pIdx]);
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading product details");
    }
  };

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`,
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params?.slug) getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.slug]);

  const groupedSpecs = product?.specifications?.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  const getValidColor = (colorName) => {
    const colors = {
      black: "#1c1c1c",
      white: "#f8f9fa",
      silver: "#c0c0c0",
      gray: "#808080",
      "space gray": "#535150",
      titanium: "#878681",
      "natural titanium": "#b5b5b1",
      blue: "#215f9b",
      "pacific blue": "#2e4755",
      red: "#d92027",
      green: "#4caf50",
      midnight: "#191f28",
      starlight: "#f8f9f4",
      gold: "#e6c387",
      purple: "#7f5283",
      yellow: "#ffd23f",
      pink: "#ffc0cb",
    };
    const normalized = colorName?.toLowerCase().trim() || "";
    return colors[normalized] || normalized;
  };

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToCart = () => {
    const itemsToAdd = [];
    for (let i = 0; i < quantity; i++) {
      const finalProduct = selectedVariant
        ? { ...product, price: selectedVariant.price, selectedVariant }
        : { ...product };
      itemsToAdd.push(finalProduct);
    }
    setCart([...cart, ...itemsToAdd]);
    localStorage.setItem("cart", JSON.stringify([...cart, ...itemsToAdd]));
    toast.success(`${quantity} item(s) added to cart successfully!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!auth?.user) {
        toast.error("Please login to write a review");
        navigate("/login");
        return;
      }

      const { data } = await axios.post(
        `/api/v1/product/product-review/${product._id}`,
        {
          rating,
          comment,
          name: auth?.user?.name,
        },
      );

      if (data?.success) {
        toast.success("Review submitted successfully!");
        setRating(5);
        setComment("");
        getProduct();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to submit review");
    }
  };

  const currentUnitPrice = selectedVariant
    ? selectedVariant.price
    : product?.price || 0;
  const currentDiscountPrice = product?.discountPrice || 0;

  const handleWhatsAppOrder = () => {
    const variantText = selectedVariant
      ? `\nVariant: ${selectedVariant.color || ""} ${selectedVariant.size || ""} ${selectedVariant.ram || ""}`
      : "";

    // 🔴 Price Calculation Fix
    const text = `Hello, I want to order:\n\n*${product.name}*${variantText}\nQuantity: ${quantity}\nTotal Price: ৳${currentUnitPrice * quantity}\n\nLink: ${window.location.href}`;

    window.open(
      `https://wa.me/${contactNumber.replace("+", "")}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const handleCallOrder = () => {
    window.location.href = `tel:${contactNumber}`;
  };

  return (
    <Layout>
      <div className="container product-details-page">
        <div className="details-grid">
          <div className="details-img-container">
            <div className="main-img-box">
              {mainImage ? (
                <img src={mainImage} alt={product.name} />
              ) : (
                <div className="text-center p-5">Loading Image...</div>
              )}
            </div>
            <div className="thumbnail-gallery">
              {product?.photo && (
                <img
                  src={product.photo}
                  className={`thumb ${mainImage === product.photo ? "active" : ""}`}
                  onClick={() => setMainImage(product.photo)}
                  alt="main"
                />
              )}
              {product?.extraPhotos?.map((photoUrl, index) => (
                <img
                  key={index}
                  src={photoUrl}
                  className={`thumb ${mainImage === photoUrl ? "active" : ""}`}
                  onClick={() => setMainImage(photoUrl)}
                  alt={`gallery-${index}`}
                />
              ))}
            </div>
          </div>

          <div className="details-info">
            {product?.brand && (
              <span className="brand-badge">{product.brand}</span>
            )}
            <h1 className="details-title">{product.name}</h1>

            {product?.rating > 0 && (
              <div className="mb-2 text-warning" style={{ fontSize: "14px" }}>
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
                <span className="text-muted ms-2">
                  ({product.numReviews} Reviews)
                </span>
              </div>
            )}

            <div className="price-section d-flex flex-column align-items-start mb-4">
              <div>
                <span className="details-price">
                  ৳ {currentUnitPrice * quantity}
                </span>
                {currentDiscountPrice > 0 && (
                  <span className="discount-price ms-3">
                    ৳ {currentDiscountPrice * quantity}
                  </span>
                )}
              </div>
              {quantity > 1 && (
                <small className="text-muted mt-1 fw-bold">
                  (৳ {currentUnitPrice} / per item)
                </small>
              )}
            </div>

            {product?.variants?.length > 0 && (
              <div className="variant-section mt-3">
                <h6>Available Options (Select One):</h6>
                <div className="variant-grid">
                  {product.variants.map((v, index) => (
                    <div
                      key={index}
                      className={`variant-card ${selectedVariant === v ? "active" : ""}`}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (
                          v.photoIndex !== undefined &&
                          v.photoIndex !== null &&
                          v.photoIndex !== ""
                        ) {
                          const pIdx = Number(v.photoIndex);
                          if (product?.extraPhotos?.[pIdx]) {
                            setMainImage(product.extraPhotos[pIdx]);
                          } else {
                            setMainImage(product?.photo);
                          }
                        } else {
                          setMainImage(product?.photo);
                        }
                      }}
                    >
                      {(v.ram || v.storage) && (
                        <div className="var-main">
                          {v.ram ? `${v.ram}` : ""}{" "}
                          {v.ram && v.storage ? "/" : ""}{" "}
                          {v.storage ? `${v.storage}` : ""}
                        </div>
                      )}
                      {(v.region || v.simType) && (
                        <div className="var-sub">
                          {v.region} {v.simType ? `• ${v.simType}` : ""}
                        </div>
                      )}
                      {v.color && (
                        <div className="var-color-wrapper">
                          <span
                            className="color-circle"
                            style={{ backgroundColor: getValidColor(v.color) }}
                            title={v.color}
                          ></span>
                          <span className="var-color-text">
                            {v.color} {v.condition ? `(${v.condition})` : ""}
                          </span>
                        </div>
                      )}
                      {!v.ram && !v.storage && !v.color && (
                        <div className="var-main">Variant {index + 1}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stock-info mt-3 mb-3">
              Status:{" "}
              <b
                className={
                  selectedVariant?.stock > 0 || product?.stock > 0
                    ? "text-success"
                    : "text-danger"
                }
              >
                {selectedVariant?.stock > 0 || product?.stock > 0
                  ? `In Stock`
                  : "Out of Stock"}
              </b>
            </div>

            <div className="action-buttons-wrapper">
              <div className="quantity-box-area">
                <span className="qty-label">Quantity:</span>
                <div className="custom-qty-counter">
                  <button
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <input type="text" value={quantity} readOnly />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="main-action-btns">
                <button
                  className="btn-custom btn-cart"
                  disabled={
                    (selectedVariant && selectedVariant.stock <= 0) ||
                    (!selectedVariant && product.stock <= 0)
                  }
                  onClick={handleAddToCart}
                >
                  <i className="fa-solid fa-cart-plus me-2"></i> Add To Cart
                </button>
                <button
                  className="btn-custom btn-buy"
                  disabled={
                    (selectedVariant && selectedVariant.stock <= 0) ||
                    (!selectedVariant && product.stock <= 0)
                  }
                  onClick={handleBuyNow}
                >
                  <i className="fa-solid fa-bolt me-2"></i> Order Now
                </button>
              </div>

              <div className="support-action-btns">
                <button
                  className="btn-custom btn-whatsapp"
                  onClick={handleWhatsAppOrder}
                >
                  <i className="fa-brands fa-whatsapp me-2 fs-5"></i> WhatsApp
                  Order
                </button>
                <button
                  className="btn-custom btn-call"
                  onClick={handleCallOrder}
                >
                  <i className="fa-solid fa-phone me-2"></i> Call For Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="product-nav-tabs mt-5">
          {groupedSpecs && Object.keys(groupedSpecs).length > 0 && (
            <button
              className={`nav-tab-btn ${activeTab === "specification" ? "active" : ""}`}
              onClick={() => scrollToSection("specification")}
            >
              Specifications
            </button>
          )}
          <button
            className={`nav-tab-btn ${activeTab === "description" ? "active" : ""}`}
            onClick={() => scrollToSection("description")}
          >
            Description
          </button>

          {/* 🔴 নতুন ভিডিও ট্যাব (যদি ভিডিও থাকে তবেই শো করবে) */}
          {product?.videoLink && getYouTubeVideoId(product.videoLink) && (
            <button
              className={`nav-tab-btn ${activeTab === "video" ? "active" : ""}`}
              onClick={() => scrollToSection("video")}
            >
              Video
            </button>
          )}

          <button
            className={`nav-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => scrollToSection("reviews")}
          >
            Reviews ({product?.numReviews || 0})
          </button>
        </div>

        <div className="scrollable-content-area">
          {groupedSpecs && Object.keys(groupedSpecs).length > 0 && (
            <div id="specification" className="scroll-section">
              <h4 className="section-heading border-bottom pb-2">
                Product Specifications
              </h4>
              <div className="spec-table-wrapper mt-3">
                {Object.keys(groupedSpecs).map((category, index) => (
                  <div key={index} className="spec-group">
                    <table className="spec-table">
                      <tbody>
                        {groupedSpecs[category].map((spec, i) => (
                          <tr key={i}>
                            <td className="spec-category">
                              {i === 0 ? category : ""}
                            </td>
                            <td className="spec-name">{spec.name}</td>
                            <td className="spec-value">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="description" className="scroll-section mt-5">
            <h4 className="section-heading border-bottom pb-2">
              Product Overview
            </h4>
            <div
              className="rich-content mt-3"
              dangerouslySetInnerHTML={{ __html: product?.description }}
            />
          </div>

          {/* 🔴 ইউটিউব ভিডিও সেকশন */}
          {product?.videoLink && getYouTubeVideoId(product.videoLink) && (
            <div id="video" className="scroll-section mt-5">
              <h4 className="section-heading border-bottom pb-2">
                <i className="fa-brands fa-youtube text-danger me-2"></i>{" "}
                Product Video
              </h4>
              <div
                className="video-container mt-4"
                style={{
                  position: "relative",
                  paddingBottom: "56.25%" /* 16:9 Aspect Ratio */,
                  height: 0,
                  overflow: "hidden",
                  borderRadius: "10px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <iframe
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(product.videoLink)}`}
                  title="Product YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div id="reviews" className="scroll-section mt-5 mb-5">
            <h4 className="section-heading border-bottom pb-2">
              Customer Reviews ({product?.numReviews || 0})
            </h4>

            {/* ১. রিভিউগুলোর লিস্ট দেখানো */}
            <div className="reviews-list mt-4">
              {product?.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, i) => (
                  <div
                    key={i}
                    className="review-card mb-3 p-3 border rounded shadow-sm bg-white"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark">
                        <i className="fa-solid fa-user-circle me-2 text-secondary"></i>
                        {r.name}
                      </h6>
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* স্টার রেটিং */}
                    <div
                      className="text-warning mb-2"
                      style={{ fontSize: "14px" }}
                    >
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    <p
                      className="mb-0 text-secondary"
                      style={{ fontSize: "14px" }}
                    >
                      {r.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-muted mt-3">
                  <p>
                    No reviews have been submitted yet. Be the first to review
                    this product!
                  </p>
                </div>
              )}
            </div>

            {/* ২. রিভিউ লেখার ফর্ম */}
            <div
              className="write-review-section mt-5 p-4 rounded"
              style={{ backgroundColor: "#f8f9fa", border: "1px solid #eee" }}
            >
              <h5 className="mb-3 fw-bold">Write a Review</h5>
              {auth?.user ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Rating</label>
                    <select
                      className="form-select"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                    >
                      <option value="5">5 - Excellent (⭐⭐⭐⭐⭐)</option>
                      <option value="4">4 - Very Good (⭐⭐⭐⭐)</option>
                      <option value="3">3 - Good (⭐⭐⭐)</option>
                      <option value="2">2 - Fair (⭐⭐)</option>
                      <option value="1">1 - Poor (⭐)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      placeholder="Share your experience with this product..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="alert alert-warning m-0">
                  You must be{" "}
                  <Link to="/login" className="fw-bold text-decoration-none">
                    Logged In
                  </Link>{" "}
                  to write a review.
                </div>
              )}
            </div>
          </div>
        </div>

        <SimilarProducts products={relatedProducts} title="Similar Products" />
      </div>
    </Layout>
  );
};

export default ProductDetails;
