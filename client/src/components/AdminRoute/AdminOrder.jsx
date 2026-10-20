// src/components/AdminRoute/AdminOrders.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";

import AdminMenu from "./AdminMenu";
import moment from "moment";
import { toast } from "react-toastify";
import "./AdminOrder.css";

const AdminOrders = () => {
  const [status, setStatus] = useState([
    "Not Process",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancel",
  ]);
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();

  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChange = async (orderId, value) => {
    try {
      await axios.put(`/api/v1/auth/update-order-status/${orderId}`, {
        status: value,
      });
      getOrders();
      toast.success("Order status updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      );
      if (!confirmDelete) return;

      const { data } = await axios.delete(
        `/api/v1/auth/delete-order/${orderId}`,
      );

      if (data?.success) {
        toast.success("Order deleted successfully");
        setOrders(orders.filter((order) => order._id !== orderId));
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while deleting order");
    }
  };

  return (
    <>
      <div className="container dashboard-grid admin-orders-main">
        <div className="row mt-3">
          <div className="col-md-3">
              
          </div>
          <div className="col-md-9">
            <h1 className="page-title text-center mb-4">Manage All Orders</h1>

            {orders?.map((o, i) => (
              <div className="order-wrapper border shadow mb-5" key={o._id}>
                <div className="table-responsive">
                  <table className="custom-table table">
                    <thead>
                      <tr>
                        <th>
                          <i className="fa-solid fa-hashtag text-muted me-1"></i>{" "}
                          ID
                        </th>
                        <th>
                          <i className="fa-solid fa-spinner text-muted me-1"></i>{" "}
                          Status
                        </th>
                        <th>
                          <i className="fa-solid fa-user text-muted me-1"></i>{" "}
                          Buyer/Guest
                        </th>
                        <th>
                          <i className="fa-solid fa-phone text-muted me-1"></i>{" "}
                          Contact
                        </th>
                        <th>
                          <i className="fa-regular fa-calendar text-muted me-1"></i>{" "}
                          Date
                        </th>
                        <th>
                          <i className="fa-solid fa-credit-card text-muted me-1"></i>{" "}
                          Payment
                        </th>
                        <th>
                          <i className="fa-solid fa-box-open text-muted me-1"></i>{" "}
                          Items
                        </th>
                        <th>
                          <i className="fa-solid fa-bolt text-muted me-1"></i>{" "}
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td>
                          <select
                            className="status-select-dropdown"
                            onChange={(e) =>
                              handleChange(o._id, e.target.value)
                            }
                            defaultValue={o?.status}
                          >
                            {status.map((s, idx) => (
                              <option key={idx} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          {o?.buyer?.name ? (
                            <span className="user-name">
                              👤 {o?.buyer?.name} <small>(User)</small>
                            </span>
                          ) : (
                            <span className="guest-name">
                              🛒 {o?.guestDetails?.name} <small>(Guest)</small>
                            </span>
                          )}
                        </td>

                        <td>
                          {o?.buyer?.phone ? (
                            <span>{o?.buyer?.phone}</span>
                          ) : (
                            <span>{o?.guestDetails?.phone || "N/A"}</span>
                          )}
                        </td>

                        <td>{moment(o?.createdAt).fromNow()}</td>
                        <td>
                          <span className="payment-method">
                            {o?.paymentMethod || "COD"}
                          </span>
                        </td>
                        <td>{o?.products?.length}</td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(o._id)}
                            title="Delete Order"
                          >
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="admin-product-list p-3 bg-light">
                  {o?.products?.map((p, index) => (
                    <div
                      className="product-row d-flex align-items-center mb-2 border-bottom pb-2"
                      key={index}
                    >
                      <div className="product-img-box">
                        {/* ফিক্স: ছবি না থাকলে ডিফল্ট প্লেসহোল্ডার ইমেজ দেখাবে */}
                        <img
                          src={
                            p.photo ||
                            "https://via.placeholder.com/60?text=No+Image"
                          }
                          alt={p.name}
                          width="60px"
                          height="60px"
                          className="rounded shadow-sm"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/60?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="product-info-box ms-3">
                        <p className="mb-0 fw-bold">{p.name}</p>

                        {/* ফিক্স: সঠিক ভেরিয়েন্ট ফিল্ডগুলো (color, size) রেন্ডার করা হলো */}
                        <div className="mt-1">
                          {p.selectedVariant &&
                          Object.keys(p.selectedVariant).length > 0 ? (
                            <>
                              {p.selectedVariant.color && (
                                <span className="variant-badge">
                                  🎨 Color: {p.selectedVariant.color}
                                </span>
                              )}
                              {p.selectedVariant.size && (
                                <span className="variant-badge ms-2">
                                  📏 Size: {p.selectedVariant.size}
                                </span>
                              )}
                              {p.selectedVariant.material && (
                                <span className="variant-badge ms-2">
                                  🧵 Material: {p.selectedVariant.material}
                                </span>
                              )}
                              {p.selectedVariant.style && (
                                <span className="variant-badge ms-2">
                                  ✨ Style: {p.selectedVariant.style}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted small">
                              No variant selected
                            </span>
                          )}
                        </div>

                        <p className="mb-0 text-dark small mt-1">
                          <strong>Price:</strong> ৳ {p.price} |{" "}
                          <strong>Qty:</strong> 1
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="order-footer mt-3">
                    <p className="small mb-0">
                      <i className="fa fa-map-marker-alt text-danger me-2"></i>
                      <strong>Shipping To:</strong>{" "}
                      {o?.guestDetails?.address ||
                        o?.buyer?.address ||
                        "Address not provided"}
                    </p>
                    {o?.guestDetails?.note && (
                      <p className="small mb-0 text-muted mt-1">
                        <strong>Note:</strong> {o.guestDetails.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <h4 className="text-center mt-5">No orders found.</h4>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
