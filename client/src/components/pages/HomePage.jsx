import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import { toast } from "react-toastify";
import HeroSlider from "./HeroSlider"; // পাথ নিশ্চিত করে নিন
import CategorySection from "./CategorySection"; // পাথ নিশ্চিত করে নিন
// সবার উপরে ইম্পোর্ট করবেন
import HomeCategoryIcons from "./HomeCategoryIcons";

import "./HomePage.css";

const Home = () => {
  const [categories, setCategories] = useState([]);

  // সব ক্যাটাগরি ডাটাবেজ থেকে আনার ফাংশন
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while getting categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  return (
    <Layout title={"rupomiq - Best Online Grocery & Medicine"}>
      <div className="home-container">
        {/* ১. কাস্টম ব্যানার স্লাইডার (Hero Section) */}
        <HeroSlider />

        <HomeCategoryIcons />
        {/* ২. ক্যাটাগরি ভিত্তিক সেকশন (Horizontal Scroll) */}
        <div className="product-section">
          {/* এখানে ক্যাটাগরি লিস্ট থেকে ম্যাপ করে সেকশন তৈরি হচ্ছে */}
          {categories?.map((c) => (
            <CategorySection key={c._id} title={c.name} slug={c.slug} />
          ))}
        </div>
        {/* ৩. চাইলে নিচে একটি 'All Products' গ্রিড রাখতে পারেন (ঐচ্ছিক) */}
        {/* যদি শুধু ক্যাটাগরি স্লাইডার রাখতে চান তবে এটি বাদ দিতে পারেন */}
      </div>
    </Layout>
  );
};

export default Home;
