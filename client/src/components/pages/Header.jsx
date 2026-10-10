// Header.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { toast } from "react-toastify";
import axios from "axios";
import Search from "./Search";
import "./Header.css";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logout successful");
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* ১. মোবাইল সাইডবার ওভারলে (Backdrop) */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* ২. মূল হেডার */}
      <header className="navbar-area">
        <div className="nav-container">
          {/* ============ ১. বাম পাশ: ন্যাভ বাটন ============ */}
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>

          {/* ============ ২. মাঝখান: লোগো এবং সার্চ বার ============ */}
          <div className="header-center">
            <div className="brand-logo">
              <Link to="/">
                {/* 🔴 এখানে লোগোর ইমেজ বসানো হয়েছে। আপনার লোগোটি public ফোল্ডারে রেখে নাম মিলিয়ে দিন */}
                <img
                  src="/img/RupomiqLogo.png"
                  alt="RupomiqBd Logo"
                  className="header-logo-img"
                />
              </Link>
            </div>

            {/* ডেক্সটপ সার্চ বার */}
            <div className="search-wrapper desktop-search">
              <Search />
            </div>
          </div>

          {/* ============ ৩. ডান পাশ: একশন লিংকস ও কার্ট ============ */}
          <div className="header-right nav-actions">
            {/* ডেক্সটপ ক্যাটাগরি ড্রপডাউন (Hover Effect) */}
            <div className="dropdown-wrapper desktop-only">
              <span className="nav-item has-dropdown">
                Categories <i className="fa-solid fa-angle-down ms-1"></i>
              </span>
              <div className="dropdown-menu">
                {categories?.map((c) => (
                  <NavLink
                    key={c._id}
                    to={`/category/${c.slug}`}
                    className="dropdown-link"
                  >
                    {c.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <NavLink to="/" className="nav-item desktop-only">
              Home
            </NavLink>

            {/* ইউজার অথেন্টিকেশন / ড্রপডাউন */}
            {!auth.user ? (
              <div className="auth-links desktop-only">
                <NavLink to="/login" className="login-btn">
                  Login
                </NavLink>
              </div>
            ) : (
              <div className="dropdown-wrapper desktop-only">
                <span className="nav-item has-dropdown user-name-badge">
                  <i className="fa-regular fa-circle-user me-1"></i>
                  {auth?.user?.name.split(" ")[0]}
                </span>
                <div className="dropdown-menu user-menu">
                  <NavLink
                    to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
                    className="dropdown-link"
                  >
                    Dashboard
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="dropdown-link logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* কার্ট আইকন */}
            <NavLink to="/cart" className="nav-item cart-btn">
              <i className="fa-solid fa-cart-shopping"></i>
              {cart?.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </NavLink>
          </div>
        </div>

        {/* মোবাইলের জন্য আলাদা সার্চ বার (হেডারের নিচে বসবে) */}
        <div className="mobile-search-bar">
          <Search />
        </div>
      </header>

      {/* ৩. মোবাইল সাইডবার (Drawer) */}
      <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          {/* 🔴 "Menu" লেখার বদলে এখানে লোগো বসানো হলো */}
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img
              src="img/RupomiqLogo.png"
              alt="RupomiqBd Logo"
              className="sidebar-logo-img"
            />
          </Link>

          {/* ক্লোজ বাটন */}
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="sidebar-content">
          <button
            className="call-order-btn"
            onClick={() => (window.location.href = "tel:+8801817141213")}
          >
            <i className="fa-solid fa-phone-volume"></i> Call for Order
          </button>

          <div className="mobile-auth-section">
            {!auth.user ? (
              <>
                <NavLink to="/login" onClick={() => setIsOpen(false)}>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> Login
                </NavLink>
                <NavLink to="/register" onClick={() => setIsOpen(false)}>
                  <i className="fa-solid fa-user-plus"></i> Register
                </NavLink>
              </>
            ) : (
              <>
                <div className="mobile-user-info">
                  <span className="fw-bold text-dark">
                    Hi, {auth?.user?.name}
                  </span>
                </div>
                <NavLink
                  to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fa-solid fa-border-all"></i> Dashboard
                </NavLink>
                <button onClick={handleLogout} className="mobile-logout">
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </>
            )}
          </div>

          <p className="sidebar-label">Shop by Categories</p>
          <div className="sidebar-category-list">
            {categories?.map((c) => (
              <NavLink
                key={c._id}
                to={`/category/${c.slug}`}
                className="sidebar-cat-link"
                onClick={() => setIsOpen(false)}
              >
                <span>{c.name}</span>
                <i className="fa-solid fa-chevron-right arrow-icon"></i>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
