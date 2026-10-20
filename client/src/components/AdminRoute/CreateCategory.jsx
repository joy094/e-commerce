//src/components/AdminRoute/CreateCategory.jsx

import React from "react";

import AdminMenu from "./AdminMenu";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import CategoryForm from "./CategoryForm";

import "./CreateCategory.css";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/category/create-category", {
        name,
      });
      if (data?.success) {
        toast.success(data.message);
        setName("");
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
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const { data } = await axios.put(
        `/api/v1/category/update-category/${selectedCategory._id}`,
        { name: updatedName },
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

          <div className="form-container-card">
            <CategoryForm
              handleSubmit={handleSubmit}
              value={name}
              setValue={setName}
            />
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
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
            <div className="modal-body">
              <input
                className="modal-input"
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
              <button className="btn-primary" onClick={handleEditSave}>
                Update Name
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
