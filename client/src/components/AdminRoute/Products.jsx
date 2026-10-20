// client/src/components/AdminRoute/Products.jsx

import React, { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";

import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  // সব প্রোডাক্ট আনার ফাংশন
  const getAllProducts = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/get-product");
      setProducts(data.products);
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
    }z
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // HTML ট্যাগ রিমুভ করে শুধু প্লেইন টেক্সট দেখানোর ফাংশন
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, ""); // রেগুলার এক্সপ্রেশন দিয়ে সব < > ট্যাগ মুছে ফেলা
  };

  return (
    <>
      <div className="container dashboard-grid">
          
        <div className="content-area">
          <h1 className="page-title">Manage Products ({products.length})</h1>

          <div className="admin-product-grid">
            {products?.map((p) => (
              <Link
                key={p._id}
                to={`/dashboard/admin/update-product/${p.slug}`} // আপনার রাউটের নাম অনুযায়ী ঠিক করে নিবেন (যেমন update-product)
                className="admin-product-link"
              >
                <div className="admin-product-card">
                  {/* স্ট্যাটাস ব্যাজ */}
                  <span
                    className={`status-badge ${p.quantity > 0 ? "in-stock" : "out-of-stock"}`}
                  >
                    {p.quantity > 0
                      ? `In Stock: ${p.quantity}`
                      : "Out of Stock"}
                  </span>

                  <div className="img-wrapper">
                    <img
                      src={p.photo}
                      alt={p.name}
                    />
                  </div>

                  <div className="admin-product-info">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="admin-product-name" title={p.name}>
                        {p.name.length > 35
                          ? p.name.substring(0, 35) + "..."
                          : p.name}
                      </h5>
                    </div>

                    {/* ব্র্যান্ড এবং ভেরিয়েন্ট ইনফো */}
                    <div className="meta-info mb-2">
                      {p.brand && <span className="meta-brand">{p.brand}</span>}
                      {p.variants?.length > 0 && (
                        <span className="meta-variants">
                          {p.variants.length} Variants
                        </span>
                      )}
                    </div>

                    {/* ক্লিন করা ডেসক্রিপশন */}
                    <p className="admin-product-desc">
                      {stripHtml(p.description).substring(0, 60)}...
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <p className="admin-product-price m-0">৳ {p.price}</p>
                      <button className="btn-edit-sm">Edit / Update</button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
