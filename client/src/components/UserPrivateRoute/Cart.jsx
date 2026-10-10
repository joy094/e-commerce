// src/components/UserPrivateRoute/Cart.jsx

import React, { useState } from "react";
import Layout from "../../components/pages/Layout";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Cart.css";

const Cart = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const navigate = useNavigate();

  // 🔴 নতুন OTP স্টেটস
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false); // লোডিং দেখানোর জন্য

  // Total Price calculation
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "BDT",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Remove item from cart
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
      toast.info("Item removed from cart");
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // ১. OTP সেন্ড করার ফাংশন
  // ==========================================
  const handleSendOtp = async () => {
    // ইউজারের ফোন নম্বর বের করা (লগইন করা থাকলে auth থেকে, না থাকলে guest ফর্ম থেকে)
    const phone = auth?.token ? auth?.user?.phone : guestDetails.phone;

    if (!phone) {
      return toast.error("Phone number is required!");
    }

    try {
      setIsLoading(true);
      // ব্যাকএন্ডের OTP API তে রিকোয়েস্ট পাঠানো
      const { data } = await axios.post("/api/v1/otp/send-otp", { phone });

      if (data?.success) {
        toast.success(`OTP has been sent to ${phone}`);
        setIsOtpModalOpen(true); // OTP পপআপ ওপেন হবে
      } else {
        toast.error(data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // ২. OTP ভেরিফাই করে মূল অর্ডার সেভ করার ফাংশন
  // ==========================================
  const handleVerifyAndOrder = async () => {
    if (!otp || otp.length < 4) {
      return toast.error("Please enter a valid OTP!");
    }

    const phone = auth?.token ? auth?.user?.phone : guestDetails.phone;

    // ডাটাবেসে সেভ করার জন্য অর্ডারের ডেটা প্রস্তুত করা
    const orderData = {
      cart,
      customerDetails: auth?.token
        ? {
            name: auth?.user?.name,
            email: auth?.user?.email,
            phone: auth?.user?.phone,
            address: auth?.user?.address,
          }
        : guestDetails,
    };

    try {
      setIsLoading(true);
      // OTP ভেরিফাই এবং অর্ডার প্লেস করার API কল
      const { data } = await axios.post("/api/v1/otp/verify-otp", {
        phone,
        otp,
        orderData,
      });

      if (data?.success) {
        setCart([]); // কার্ট খালি করা
        localStorage.removeItem("cart");
        setIsOtpModalOpen(false); // পপআপ বন্ধ করা
        setOtp("");

        toast.success("Order Verified & Placed Successfully!");

        setTimeout(() => {
          navigate("/");
        }, 2500);
      } else {
        toast.error(data?.message || "Invalid or Expired OTP!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid or Expired OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={"Your Cart - Checkout"}>
      <div className="cart-page-wrapper">
        <div className="container">
          <div className="cart-header">
            <h1>{`Hello ${auth?.token ? auth?.user?.name : "Guest User"}`}</h1>
            <p>
              {cart?.length
                ? `You have ${cart.length} items in your cart ${
                    auth?.token ? "" : " | please login to track orders"
                  }`
                : " Your Cart Is Empty"}
            </p>
          </div>

          <div className="cart-content-grid">
            {/* Left Side: Cart Items */}
            <div className="cart-items-section">
              {cart?.map((p) => (
                <div className="cart-item-row" key={p._id}>
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h3>{p.name}</h3>
                    <p className="price">৳ {p.price}</p>
                    <button
                      className="btn-remove"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side: Order Summary & Checkout */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2>Order Summary</h2>
                <hr />
                <div className="summary-total">
                  <span>Total Amount:</span>
                  <span className="total-price">{totalPrice()}</span>
                </div>

                {/* Guest Delivery Form */}
                {!auth?.token && cart?.length > 0 && (
                  <div className="guest-checkout-form">
                    <h4>Delivery Details (COD)</h4>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      className="form-control"
                      onChange={(e) =>
                        setGuestDetails({
                          ...guestDetails,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number (e.g. 017XXXXXXX)"
                      className="form-control"
                      onChange={(e) =>
                        setGuestDetails({
                          ...guestDetails,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                    <textarea
                      placeholder="Full Shipping Address"
                      className="form-control"
                      onChange={(e) =>
                        setGuestDetails({
                          ...guestDetails,
                          address: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>
                )}

                {/* 🔴 Place Order Button (এখন সরাসরি অর্ডার না করে OTP পাঠাবে) */}
                {cart?.length > 0 && (
                  <button
                    className="btn-place-order"
                    onClick={handleSendOtp}
                    disabled={
                      (!auth?.token &&
                        (!guestDetails.name ||
                          !guestDetails.phone ||
                          !guestDetails.address)) ||
                      isLoading
                    }
                  >
                    {isLoading ? "Sending OTP..." : "Confirm Cash on Delivery"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          ৩. OTP Verification Modal UI
      ========================================== */}
      {isOtpModalOpen && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-box">
            <h3>Verify Your Number</h3>
            <p>
              We've sent a 6-digit OTP to <br />
              <strong>
                {auth?.token ? auth?.user?.phone : guestDetails.phone}
              </strong>
            </p>

            <input
              type="number"
              placeholder="Enter OTP Code"
              className="otp-input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="otp-modal-actions">
              <button
                className="btn-otp-cancel"
                onClick={() => setIsOtpModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-otp-verify"
                onClick={handleVerifyAndOrder}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Cart;
