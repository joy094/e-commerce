import React from "react";

import { useAuth } from "../../context/auth";
import AdminMenu from "./AdminMenu";
import "./AdminDashboard.css"; // নতুন CSS ফাইল

const AdminDashboard = () => {
  const [auth] = useAuth();
  return (
    <>
      <div className="container admin-dashboard-grid">
          
        <div className="admin-content-area">
          <div className="admin-profile-card">
            <div className="admin-card-header">
              <div className="admin-badge">ADMIN</div>
              <h1 className="admin-title">Admin Information</h1>
            </div>
            
            <div className="admin-info-body">
              <div className="info-box">
                <label>Full Name</label>
                <p>{auth?.user?.name}</p>
              </div>
              <div className="info-box">
                <label>Email Address</label>
                <p>{auth?.user?.email}</p>
              </div>
              <div className="info-box">
                <label>Contact Number</label>
                <p>{auth?.user?.phone || "Not Provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;