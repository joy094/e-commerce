import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 🔴 ৫ মিনিট পর ডকুমেন্টটি অটোমেটিক ডিলিট হয়ে যাবে
  },
});

export default mongoose.model("Otp", otpSchema);