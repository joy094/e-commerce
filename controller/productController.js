//productController.js

import slugify from "slugify";
import productModel from "../model/productModel.js";
import categoryModel from "../model/categoryModel.js";
import orderModel from "../model/orderModel.js";
import fs from "fs";
import JWT from "jsonwebtoken";
import Fuse from "fuse.js";

import { v2 as cloudinary } from "cloudinary";

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- ১. ক্রিয়েট প্রোডাক্ট ---
export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      brand,
      discountPrice,
      highlights,
      variants,
      specifications,
      videoLink, // 🔴 ইউটিউব লিংকের জন্য এটি যুক্ত করা হলো
    } = req.fields;
    const { photo, extraPhotos } = req.files;

    // ১. ভ্যালিডেশন
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({ error: "Required fields are missing" });
    }

    const products = new productModel({
      ...req.fields, // 🔴 videoLink সহ বাকি সব ফিল্ড এখানে স্বয়ংক্রিয়ভাবে চলে আসবে
      slug: slugify(name, { lower: true, strict: false }),
    });

    // ২. ডাইনামিক ডাটা প্রসেসিং
    if (highlights) products.highlights = JSON.parse(highlights);
    if (variants) products.variants = JSON.parse(variants);
    if (specifications) products.specifications = JSON.parse(specifications);

    // ৩. মেইন ফটো Cloudinary-তে আপলোড (FIXED)
    if (photo) {
      const uploadedResponse = await cloudinary.uploader.upload(photo.path, {
        folder: "rupomiq_products",
      });
      products.photo = uploadedResponse.secure_url; // ডিরেক্ট URL সেভ হচ্ছে
    }

    // ৪. মাল্টিপল এক্সট্রা ফটো Cloudinary-তে আপলোড (FIXED)
    if (extraPhotos) {
      const photosArray = Array.isArray(extraPhotos)
        ? extraPhotos
        : [extraPhotos];
      console.log("রিসিভ করা ছবির সংখ্যা:", photosArray.length);

      const extraPhotosUrls = [];
      for (let i = 0; i < photosArray.length; i++) {
        const uploadedResponse = await cloudinary.uploader.upload(
          photosArray[i].path,
          {
            folder: "rupomiq_products",
          }
        );
        extraPhotosUrls.push(uploadedResponse.secure_url);
      }
      products.extraPhotos = extraPhotosUrls;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully with Cloudinary",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in creation",
      error: error.message,
    });
  }
};

// --- ২. সব প্রোডাক্ট দেখা ---
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      // .select("-photo") // এখন আর photo হাইড করার দরকার নেই কারণ এটি শুধু একটি URL
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: products.length,
      message: "All products fetched",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// --- ৩. নির্দিষ্ট প্রোডাক্ট ---
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category");

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product Not Found" });
    }

    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching single product",
    });
  }
};

// --- ৪. প্রোডাক্ট ফটো লোড (এখন আর তেমন দরকার নেই, ফ্রন্টএন্ড ডিরেক্ট URL লোড করবে) ---
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product?.photo) {
      // ক্লাউডিনারি ব্যবহার করলে রিডাইরেক্ট করে দেওয়া যায় অথবা ফ্রন্টএন্ডে সরাসরি ইউজ করা যায়
      return res.redirect(product.photo);
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Error loading photo" });
  }
};

// --- ৫. আপডেট প্রোডাক্ট ---
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      variants,
      specifications,
      videoLink, // 🔴 ইউটিউব লিংকের জন্য এটি যুক্ত করা হলো
    } = req.fields;
    const { photo } = req.files;

    if (!name) return res.status(400).send({ error: "Name is required" });

    let slug = slugify(name, { lower: true, strict: false });
    if (!slug || slug === "") {
      slug = name.trim().replace(/\s+/g, "-").toLowerCase();
    }

    const updateData = { ...req.fields, slug }; // 🔴 videoLink সহ বাকি আপডেট ডেটা এখানে চলে আসবে

    if (variants) updateData.variants = JSON.parse(variants);
    if (specifications) updateData.specifications = JSON.parse(specifications);

    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateData,
      { new: true },
    );

    // আপডেট করার সময় Cloudinary-তে আপলোড (FIXED)
    if (photo) {
      const uploadedResponse = await cloudinary.uploader.upload(photo.path, {
        folder: "rupomiq_products",
      });
      product.photo = uploadedResponse.secure_url;
      await product.save();
    }

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while updating product",
    });
  }
};

// --- ৬. প্রোডাক্ট ডিলিট ---
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid);
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error deleting product" });
  }
};

// --- ৭. স্মার্ট অর্ডার কন্ট্রোলার ---
export const createOrderController = async (req, res) => {
  try {
    const { cart, customerDetails } = req.body;
    let userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const decode = JWT.verify(authHeader, process.env.JWT_SECRET);
        userId = decode._id;
      } catch (err) {
        console.log("Token verification failed, treating as guest");
      }
    }

    const order = new orderModel({
      products: cart,
      payment: { method: "COD", status: "Pending" },
      paymentMethod: "COD",
      buyer: userId,
      guestDetails: userId ? null : customerDetails,
      status: "Not Process",
    });

    await order.save();
    res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error placing order", error });
  }
};

// --- ৮. ক্যাটাগরি অনুযায়ী প্রোডাক্ট ফিল্টার ---
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Not Found",
      });
    }

    const products = await productModel
      .find({ category: category._id })
      .populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.error("Category Product Error:", error);
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Error while getting products by category",
    });
  }
};

// --- ৯. প্রোডাক্ট সার্চ কন্ট্রোলার ---
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[শষ]/g, "স")
    .replace(/[ঈী]/g, "ি")
    .replace(/[ঊূ]/g, "ু")
    .replace(/[ড়ঢ়]/g, "র")
    .trim();
};

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await productModel.find({}).populate("category");

    const processedData = products.map((p) => ({
      ...p._doc,
      searchName: normalizeText(p.name),
      searchCategory: normalizeText(p.category?.name || ""),
    }));

    const fuseOptions = {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "searchName", weight: 0.5 },
        { name: "category.name", weight: 0.3 },
        { name: "searchCategory", weight: 0.2 },
        "description",
      ],
      threshold: 0.4,
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 2,
    };

    const fuse = new Fuse(processedData, fuseOptions);
    const results = fuse.search(normalizeText(keyword));
    const finalProducts = results.map((result) => result.item);

    res.status(200).send({
      success: true,
      products: finalProducts.slice(0, 10),
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in Search API",
      error,
    });
  }
};

// --- এক্সট্রা ফটো কন্ট্রোলার (Redirect to Cloudinary) ---
export const extraPhotoController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.pid)
      .select("extraPhotos");

    const index = parseInt(req.params.index, 10);

    if (product?.extraPhotos && product.extraPhotos[index]) {
      return res.redirect(product.extraPhotos[index]);
    } else {
      return res
        .status(404)
        .send({ success: false, message: "Photo not found" });
    }
  } catch (error) {
    console.error("Extra Photo Error:", error);
    res
      .status(500)
      .send({ success: false, message: "Error in loading extra photo" });
  }
};

// ==========================================
// Get Related / Similar Products
// ==========================================
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    const products = await productModel
      .find({
        category: cid, // একই ক্যাটাগরির প্রোডাক্ট খুঁজবে
        _id: { $ne: pid }, // কিন্তু বর্তমানে যে প্রোডাক্টটি দেখছি, সেটিকে বাদ দিবে ($ne = not equal)
      })
      .limit(4) // শুধুমাত্র ৪টি রিলেটেড প্রোডাক্ট দেখাবে (যাতে পেজ সুন্দর লাগে)
      .populate("category"); // ক্যাটাগরির বিস্তারিত তথ্য সাথে পাঠাবে

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products",
      error,
    });
  }
};

// controllers/productController.js এ নিচের ফাংশনটি যুক্ত করুন:

// ==========================================
// 🔴 Create Product Review (FIXED)
// ==========================================
export const createProductReviewController = async (req, res) => {
  try {
    // 🔴 req.body থেকে name রিসিভ করা হলো (ফ্রন্টএন্ড থেকে পাঠানো নাম)
    const { rating, comment, name } = req.body;
    const product = await productModel.findById(req.params.pid);

    if (product) {
      // চেক করা যে ইউজার আগে রিভিউ দিয়েছে কিনা
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );

      if (alreadyReviewed) {
        return res.status(400).send({
          success: false,
          message: "আপনি ইতিমধ্যে এই প্রোডাক্টের রিভিউ দিয়েছেন",
        });
      }

      // নতুন রিভিউ তৈরি
      const review = {
        name: name || req.user.name || "Customer", // 🔴 এখন আর undefined হবে না
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      // রিভিউটি প্রোডাক্টের অ্যারেতে পুশ করা
      product.reviews.push(review);
      product.numReviews = product.reviews.length;

      // গড় রেটিং (Average Rating) হিসাব করা
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).send({
        success: true,
        message: "রিভিউ সফলভাবে যুক্ত হয়েছে!",
      });
    } else {
      res.status(404).send({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating review",
      error,
    });
  }
};


