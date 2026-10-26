import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useCart } from "../../context/cart";
import "./LandingPageView.css";
import Layout from "./Layout";

const LandingPageView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const { data } = await axios.get(`/api/v1/landing-page/${slug}`);
        if (data?.success) {
          setPageData(data.landingPage);
        }
      } catch (error) {
        console.log("Error fetching landing page:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchLandingPage();
  }, [slug]);

  if (loading)
    return (
      <div className="text-center mt-5 pt-5">
        <h4>Loading Offer...</h4>
      </div>
    );
  if (!pageData)
    return (
      <div className="text-center mt-5 pt-5 text-danger">
        <h4>Offer Not Found or Expired!</h4>
      </div>
    );

  const { product, customContent } = pageData;
  const displayPrice = customContent?.offerPrice || product?.price;
  const displayHeadline = customContent?.headline || product?.name;

  // সরাসরি অর্ডার বাটনে ক্লিক করলে কার্টে অ্যাড হয়ে চেকআউটে চলে যাবে
  const handleOrderNow = () => {
    setCart([...cart, product]);
    localStorage.setItem("cart", JSON.stringify([...cart, product]));
    toast.success("Item ready for checkout!");
    navigate("/cart"); // অথবা সরাসরি "/checkout" যদি আপনার চেকআউট রাউট থাকে
  };

  return (
    <Layout>
    <div className="landing-page-wrapper">
      <div className="lp-container">
        {/* ================= হেডার সেকশন ================= */}
        <div className="lp-header text-center">
          <h1 className="lp-headline">{displayHeadline}</h1>
          {customContent?.subHeadline && (
            <p className="lp-subheadline">{customContent.subHeadline}</p>
          )}
        </div>

        {/* ================= প্রোডাক্ট ডিটেইলস সেকশন ================= */}
        <div className="lp-content-box">
          <div className="row align-items-center">
            <div className="col-md-6 text-center mb-4 mb-md-0">
              <img
                src={`/api/v1/product/product-photo/${product?._id}`}
                alt={product?.name}
                className="lp-product-image"
              />
            </div>

            <div className="col-md-6">
              <div className="lp-price-box">
                <span className="lp-offer-text">Special Offer Price:</span>
                <div className="lp-price">
                  <span className="current">৳ {displayPrice}</span>
                  {displayPrice < product?.price && (
                    <del className="old">৳ {product?.price}</del>
                  )}
                </div>
              </div>

              <div className="lp-features mt-4">
                <p>
                  <i className="fa-solid fa-truck-fast text-success"></i> সারা
                  বাংলাদেশে ক্যাশ অন ডেলিভারি (COD)
                </p>
                <p>
                  <i className="fa-solid fa-shield-check text-success"></i> ১০০%
                  অরিজিনাল প্রোডাক্ট গ্যারান্টি
                </p>
                <p>
                  <i className="fa-solid fa-arrow-rotate-left text-success"></i>{" "}
                  ৩ দিনের রিপ্লেসমেন্ট সুবিধা
                </p>
              </div>

              <button className="lp-order-btn mt-4" onClick={handleOrderNow}>
                <i className="fa-solid fa-bag-shopping"></i> এখনই অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default LandingPageView;
