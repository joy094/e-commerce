import LandingPage from "../model/landingPageModel.js";
import slugify from "slugify";

// ১. Create New Landing Page (অ্যাডমিন প্যানেল থেকে পেজ তৈরি করার জন্য)
export const createLandingPageController = async (req, res) => {
  try {
    const {
      product,
      template,
      customContent,
      extraImages,
      status,
      trackingPixel,
    } = req.body;

    if (!product) {
      return res.status(400).send({ message: "Product ID is required" });
    }

    // একটি ইউনিক স্লাগ বা URL তৈরি করা (যেমন: premium-sunglasses-offer)
    // ক্লায়েন্ট চাইলে কাস্টম স্লাগও দিতে পারে, না দিলে হেডলাইন বা রেন্ডম স্ট্রিং দিয়ে তৈরি হবে
    const baseSlug = customContent?.headline
      ? slugify(customContent.headline, { lower: true })
      : `lp-${product}`;
    const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

    const landingPage = await new LandingPage({
      product,
      slug: uniqueSlug,
      template: template || "cod-sales",
      customContent,
      extraImages,
      status: status || "published",
      trackingPixel,
    }).save();

    res.status(201).send({
      success: true,
      message: "Landing Page Created Successfully",
      landingPage,
    });
  } catch (error) {
    console.error("Error creating landing page:", error);
    res.status(500).send({
      success: false,
      message: "Error creating landing page",
      error: error.message,
    });
  }
};

// ২. Get All Landing Pages (অ্যাডমিন প্যানেলের লিস্টে দেখানোর জন্য)
export const getAllLandingPagesController = async (req, res) => {
  try {
    // populate("product") দিয়ে মূল প্রোডাক্টের নাম ও ছবি একসাথে নিয়ে আসা হচ্ছে
    const landingPages = await LandingPage.find({})
      .populate("product", "name price photo slug")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All landing pages fetched",
      landingPages,
    });
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching landing pages",
    });
  }
};

// ৩. Get Single Landing Page by Slug (কাস্টমার যখন লিংকে ভিজিট করবে তখন দেখানোর জন্য)
export const getSingleLandingPageController = async (req, res) => {
  try {
    const { slug } = req.params;

    // কাস্টমার পেজ লোড করলে মূল প্রোডাক্টের সব ডেটা (description, images) populate হয়ে আসবে
    const landingPage = await LandingPage.findOne({
      slug,
      status: "published",
    }).populate("product");

    if (!landingPage) {
      return res.status(404).send({
        success: false,
        message: "Landing Page not found or inactive",
      });
    }

    res.status(200).send({
      success: true,
      landingPage,
    });
  } catch (error) {
    console.error("Error fetching single landing page:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching landing page",
    });
  }
};

// Delete Landing Page
export const deleteLandingPageController = async (req, res) => {
  try {
    const { id } = req.params;
    await LandingPage.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Landing Page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    res.status(500).send({
      success: false,
      message: "Error in deleting landing page",
      error: error.message,
    });
  }
};
