import express from "express";
// 🔴 আপনার কন্ট্রোলার ফাইল থেকে ফাংশন দুটি ইম্পোর্ট করে নিন (ফাইলের নাম ও পাথ ঠিক আছে কিনা চেক করবেন)
import {
  sendOrderOtpController,
  
} from "../controller/sendOrderOtpController.js";

import {
  verifyOtpAndPlaceOrderController,
  
} from "../controller/verifyOtpAndPlaceOrderController.js";


const router = express.Router();

// ==========================================
// OTP এবং Order সম্পর্কিত রাউটস
// ==========================================

// ১. OTP পাঠানোর রাউট (POST Method)
// API URL: /api/v1/order/send-otp
router.post("/send-otp", sendOrderOtpController);

// ২. OTP ভেরিফাই করে অর্ডার প্লেস করার রাউট (POST Method)
// API URL: /api/v1/order/verify-otp
router.post("/verify-otp", verifyOtpAndPlaceOrderController);

export default router;
