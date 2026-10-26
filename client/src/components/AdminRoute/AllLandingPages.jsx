import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const AllLandingPages = () => {
  const [landingPages, setLandingPages] = useState([]);
  const navigate = useNavigate();

  // ল্যান্ডিং পেজগুলো ফেচ করা
  const getAllLandingPages = async () => {
    try {
      const { data } = await axios.get("/api/v1/landing-page/all");
      if (data?.success) {
        setLandingPages(data.landingPages);
      }
    } catch (error) {
      toast.error("Failed to load landing pages");
    }
  };

  useEffect(() => {
    getAllLandingPages();
  }, []);

  // 🔴 Delete ফাংশনালিটি
  const handleDelete = async (id) => {
    let answer = window.confirm(
      "Are you sure you want to delete this landing page?",
    );
    if (!answer) return;
    try {
      const { data } = await axios.delete(`/api/v1/landing-page/delete/${id}`);
      if (data.success) {
        toast.success("Landing Page Deleted Successfully");
        getAllLandingPages(); // ডিলিট হওয়ার পর লিস্ট আপডেট করা
      }
    } catch (error) {
      toast.error("Error deleting landing page");
    }
  };

  return (
    <div className="container-fluid m-3 p-3">
      <div className="row">
        <div className="col-md-3">
         
        </div>
        <div className="col-md-9">
          <h1 className="page-title mb-4">All Landing Pages</h1>

          <div className="table-wrapper shadow-sm rounded bg-white p-3">
            <table className="table custom-table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Headline / Template</th>
                  <th>Offer Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {landingPages?.map((lp) => (
                  <tr key={lp._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={`/api/v1/product/product-photo/${lp.product?._id}`}
                          alt={lp.product?.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "5px",
                            marginRight: "10px",
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          {lp.product?.name?.substring(0, 30)}...
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "block",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        {lp.customContent?.headline || "Default"}
                      </span>
                      <small className="text-muted">{lp.template}</small>
                    </td>
                    <td className="text-danger fw-bold">
                      ৳ {lp.customContent?.offerPrice || lp.product?.price}
                    </td>
                    <td>
                      <span
                        className={`badge ${lp.status === "published" ? "bg-success" : "bg-warning"}`}
                      >
                        {lp.status}
                      </span>
                    </td>
                    <td>
                      {/* ============ Action Buttons ============ */}
                      <div className="d-flex gap-2">
                        {/* View Button */}
                        <a
                          href={`/lp/${lp.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          title="View Live"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </a>

                        {/* Copy Button */}
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Copy Link"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/lp/${lp.slug}`,
                            );
                            toast.success("Link Copied!");
                          }}
                        >
                          <i className="fa-solid fa-link"></i>
                        </button>

                        {/* 🔴 Edit Button */}
                        <button
                          className="btn btn-sm btn-outline-info"
                          title="Edit"
                          onClick={() =>
                            navigate(
                              `/dashboard/admin/edit-landing-page/${lp._id}`,
                            )
                          }
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        {/* 🔴 Delete Button */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(lp._id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {landingPages.length === 0 && (
              <h5 className="text-center text-muted mt-4">
                No Landing Pages Found.
              </h5>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLandingPages;
