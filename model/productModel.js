// productModel.js

import mongoose from "mongoose";

// === ১. রিভিউর জন্য সাব-স্কিমা (নতুন যুক্ত করা হলো) ===
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // আপনার ইউজার মডেলের নাম যদি ভিন্ন হয় (যেমন: "User"), তাহলে সেটি এখানে দেবেন
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    brand: { type: String }, // যেমন: Gucci, Ray-Ban, Local
    category: { type: mongoose.ObjectId, ref: "Category", required: true },

    // ছোট হাইলাইটস (ছবির ডান পাশে দেখানোর জন্য)
    // যেমন: ["Premium Leather", "UV400 Protection"]
    highlights: [String],

    description: { type: String, required: true }, // রিচ টেক্সট (সাধারণ বর্ণনার জন্য)

    // বেস প্রাইস এবং টোটাল স্টক
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 }, // ডিসকাউন্ট থাকলে দেখাবে
    quantity: { type: Number, required: true },

    // আগের Buffer সিস্টেম বাদ দিয়ে শুধু String (URL) রাখা হলো
    photo: { type: String },
    extraPhotos: [{ type: String }],

    // === ১. ডাইনামিক ভেরিয়েন্ট (Fashion & Accessories) ===
    variants: [
      {
        size: String, // যেমন: M, L, XL, One Size
        color: String, // যেমন: Black, Brown, Red
        material: String, // যেমন: Leather, Canvas, UV Glass
        style: String, // যেমন: Aviator, Tote Bag, Crossbody
        price: Number, // এই নির্দিষ্ট ভেরিয়েন্টের দাম
        stock: Number, // এই নির্দিষ্ট ভেরিয়েন্টের স্টক
        photoIndex: Number, // নতুন ফিল্ড: extraPhotos এর ইনডেক্স (যেমন: 0, 1, 2)
      },
    ],

    // === ২. ডাইনামিক স্পেসিফিকেশন (টেবিলের জন্য) ===
    specifications: [
      {
        category: String, // যেমন: "Material Info", "Dimensions"
        name: String, // যেমন: "Fabric", "Weight"
        value: String, // যেমন: "100% Cotton", "500g"
      },
    ],

    // === ৩. কাস্টমার রিভিউ ফিল্ড (নতুন যুক্ত করা হলো) ===
    reviews: [reviewSchema], // রিভিউগুলো এই অ্যারেতে জমা হবে
    rating: {
      type: Number,
      default: 0, // গড় রেটিং (যেমন: 4.5)
    },
    numReviews: {
      type: Number,
      default: 0, // মোট কয়টি রিভিউ পড়েছে
    },

    shipping: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Out of Stock"],
      default: "Active",
    },
    // অন্যান্য ফিল্ডের নিচে এটি যুক্ত করুন
    videoLink: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
