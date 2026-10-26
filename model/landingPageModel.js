import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema(
  {
    // ১. মূল প্রোডাক্টের সাথে লিংক (যাতে ম্যানেজ অর্ডারে সঠিক প্রোডাক্ট যায়)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // ২. ল্যান্ডিং পেজের ইউনিক ইউআরএল (যেমন: rupomiq.com/lp/premium-sunglasses)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    // ৩. টেমপ্লেট সিলেকশন (মকআপের ৩টি টেমপ্লেট অনুযায়ী)
    template: {
      type: String,
      enum: ["product-offer", "cod-sales", "minimal-product"],
      default: "cod-sales",
    },

    // ৪. কাস্টমাইজড কনটেন্ট (যদি ক্লায়েন্ট মূল প্রোডাক্টের নাম/দাম ল্যান্ডিং পেজে পরিবর্তন করে দেখাতে চায়)
    customContent: {
      headline: { type: String }, // আকর্ষণীয় হেডলাইন
      subHeadline: { type: String },
      offerPrice: { type: Number }, // স্পেশাল ডিসকাউন্ট প্রাইস
      benefits: [{ type: String }], // বুলেটে প্রোডাক্টের সুবিধাগুলো
    },

    // ৫. ল্যান্ডিং পেজের জন্য এক্সট্রা ছবি (ক্লাউডিনারি লিংকের অ্যারে)
    extraImages: [
      {
        url: { type: String }, // ক্লাউডিনারি থেকে পাওয়া নতুন ইমেজের লিংক
        public_id: { type: String },
      },
    ],

    // ৬. পেজের স্ট্যাটাস
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },

    // ৭. অ্যাড রান করার জন্য ফেসবুক পিক্সেল বা গুগল ট্যাগ (অপশনাল)
    trackingPixel: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("LandingPage", landingPageSchema);
