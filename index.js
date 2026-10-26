//index.js

import "dotenv/config"; // এটি একদম ১ নাম্বার লাইনে থাকতে হবে, যাতে সবার আগে .env লোড হয়
import express from "express";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoute.js";
import { requireSignIn } from "./middleware/authMiddleware.js";
import cors from "cors";
import bannerRoutes from "./routes/bannerRoute.js";
import otpRoutes from "./routes/otpRoute.js"; // 🔴 নতুন OTP রাউট ইম্পোর্ট করা হলো
import landingPageRoutes from "./routes/landingPageRoute.js"
const app = express();
const port = process.env.PORT || 8080;

//middelwares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//DB config
connectDB();

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/banner", bannerRoutes);
// 🔴 আপনার নতুন OTP রাউটটি এখানে যুক্ত করুন
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/landing-page", landingPageRoutes);

//get route
app.get("/", (req, res) => {
  res.send({
    message: "hello joson",
  });
});

app.listen(port, () => {
  console.log(`server is running at  ${port}`.bgCyan.white);
});
