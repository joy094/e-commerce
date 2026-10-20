// src/pages/Admin/ManageSlider.jsx

import React, { useState, useEffect } from "react";

import AdminMenu from "../../components/AdminRoute/AdminMenu";
import axios from "axios";
import { toast } from "react-toastify";
import "./ManageSlider.css"; // 🔴 CSS ফাইলটি ইম্পোর্ট করা হলো

const ManageSlider = () => {
  const [banners, setBanners] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");

  const getAllBanners = async () => {
    try {
      const { data } = await axios.get("/api/v1/banner/get-banners");
      if (data?.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while getting banners");
    }
  };

  useEffect(() => {
    getAllBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const bannerData = new FormData();
      bannerData.append("photo", photo);
      if (title) bannerData.append("title", title);
      if (subtitle) bannerData.append("subtitle", subtitle);
      if (link) bannerData.append("link", link);

      const { data } = await axios.post(
        "/api/v1/banner/create-banner",
        bannerData,
      );

      if (data?.success) {
        toast.success("Banner Uploaded Successfully");
        setPhoto(null);
        setTitle("");
        setSubtitle("");
        setLink("");
        getAllBanners();
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      let answer = window.prompt(
        "Are you sure you want to delete this banner? Type 'yes' to confirm.",
      );
      if (answer !== "yes") return;

      const { data } = await axios.delete(`/api/v1/banner/delete-banner/${id}`);
      if (data?.success) {
        toast.success("Banner Deleted Successfully");
        getAllBanners();
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="slider-dashboard container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
              
          </div>
          <div className="col-md-9">
            <h2 className="mb-4 fw-bold text-dark">Manage Hero Slider</h2>

            {/* ================= ব্যানার আপলোড ফর্ম ================= */}
            <div className="upload-card">
              <h5 className="mb-4">Upload New Banner</h5>
              <div className="mb-4">
                <label className="upload-label-area">
                  <i className="fa-solid fa-cloud-arrow-up fs-2 mb-2"></i>{" "}
                  <br />
                  {photo
                    ? photo.name
                    : "Click to Upload Banner Image (1920x600 px)"}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                  />
                </label>
              </div>

              {photo && (
                <div className="text-center mb-4">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="banner preview"
                    className="preview-img"
                  />
                </div>
              )}

              <div className="mb-3">
                <input
                  type="text"
                  value={title}
                  placeholder="Enter Title (Optional)"
                  className="form-control custom-input"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={subtitle}
                  placeholder="Enter Subtitle (Optional)"
                  className="form-control custom-input"
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={link}
                  placeholder="Enter Button Link e.g. /shop/offer (Optional)"
                  className="form-control custom-input"
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <button
                className="btn-upload"
                onClick={handleCreate}
                disabled={!photo}
              >
                <i className="fa-solid fa-upload me-2"></i> Publish Banner
              </button>
            </div>

            {/* ================= বর্তমান ব্যানার লিস্ট ================= */}
            <h5 className="active-banners-title">
              Active Banners ({banners?.length})
            </h5>
            <div className="row">
              {banners?.map((b) => (
                <div className="col-md-6 mb-4" key={b._id}>
                  <div className="banner-card">
                    <img
                      src={b.photo}
                      className="banner-card-img"
                      alt={b.title || "banner"}
                    />
                    <div className="banner-card-body">
                      {b.title && (
                        <h6 className="card-title fw-bold text-dark">
                          {b.title}
                        </h6>
                      )}
                      <button
                        className="btn-delete-banner mt-2"
                        onClick={() => handleDelete(b._id)}
                      >
                        <i className="fa-solid fa-trash-can me-2"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageSlider;
