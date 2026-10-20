// src/components/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import Layout from "../pages/Layout"; // 🔴 Layout ইম্পোর্ট করা হলো (আপনার ফোল্ডার অনুযায়ী পাথ ঠিক করে নিবেন)
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <Layout title="Admin Dashboard - RupomiqBd">
      <div className="admin-layout-container">
        {/* বামপাশে ফিক্সড বা কমন মেনু */}
        <div className="admin-sidebar">
          <AdminMenu />
        </div>

        {/* ডানপাশে যে পেজে যাবেন (যেমন: Manage Applications, Profile ইত্যাদি) তার কন্টেন্ট শো করবে */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;
