import React, { useEffect, useState } from "react";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import axios from "axios";
import "./CreateCategory.css";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(""); // 🔴 আইকনের জন্য নতুন স্টেট

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [updatedName, setUpdatedName] = useState("");
  const [updatedIcon, setUpdatedIcon] = useState(""); // 🔴 এডিট করার জন্য আইকন স্টেট

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/category/create-category", {
        name,
        icon, // 🔴 ব্যাকএন্ডে আইকন পাঠানো হচ্ছে
      });
      if (data?.success) {
        toast.success(data.message);
        setName("");
        setIcon("");
        getAllCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setUpdatedName(category.name);
    setUpdatedIcon(category.icon || ""); // 🔴 আগের আইকন বক্সে দেখানোর জন্য
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const { data } = await axios.put(
        `/api/v1/category/update-category/${selectedCategory._id}`,
        { name: updatedName, icon: updatedIcon }, // 🔴 আপডেট করা আইকন পাঠানো হচ্ছে
      );
      if (data.success) {
        toast.success(data.message);
        setEditModalOpen(false);
        getAllCategories();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const confirmDelete = async () => {
    try {
      const { data } = await axios.delete(
        `/api/v1/category/delete-category/${selectedCategory._id}`,
      );
      if (data.success) {
        toast.success("Category deleted");
        setDeleteModalOpen(false);
        getAllCategories();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="container dashboard-grid">
        <div className="content-area">
          <h1 className="page-title">Manage Categories</h1>

          {/* 🔴 নতুন ফর্ম (নাম এবং আইকন ইনপুট) */}
          <div className="form-container-card">
            <form onSubmit={handleSubmit} className="category-add-form">
              <input
                type="text"
                className="form-control"
                placeholder="Category Name (e.g. Books)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-control"
                placeholder="Icon Class (e.g. fa-solid fa-book)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "10px 20px" }}
              >
                Add Category
              </button>
            </form>
          </div>

          <div className="table-wrapper mt-4">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Icon</th> {/* 🔴 টেবিলের নতুন কলাম */}
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontSize: "20px", color: "#0284c7" }}>
                      {c.icon && c.icon.startsWith("http") ? (
                        <img
                          src={c.icon}
                          alt="icon"
                          style={{
                            width: "25px",
                            height: "25px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <i className={c.icon || "fa-solid fa-folder"}></i>
                      )}
                    </td>
                    <td>{c.name}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          setSelectedCategory(c) || setDeleteModalOpen(true)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-icon"
              onClick={() => setEditModalOpen(false)}
            >
              &times;
            </span>
            <h2>Edit Category</h2>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                className="modal-input"
                type="text"
                placeholder="Category Name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Icon Class (e.g. fa-solid fa-laptop)"
                value={updatedIcon}
                onChange={(e) => setUpdatedIcon(e.target.value)}
              />
              <button className="btn-primary" onClick={handleEditSave}>
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close-icon"
              onClick={() => setDeleteModalOpen(false)}
            >
              &times;
            </span>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{selectedCategory?.name}"</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn-danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCategory;
