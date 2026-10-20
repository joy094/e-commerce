//UpdateProduct.jsx

import React, { useState, useEffect } from "react";

import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./UpdateProduct.css";

// --- কনস্ট্যান্টস (Fashion, Bags & Accessories Presets) ---
const BRAND_OPTIONS = [
  "Gucci",
  "Ray-Ban",
  "Prada",
  "Zara",
  "Nike",
  "Adidas",
  "Puma",
  "Local Brand",
  "Non-Brand",
  "Other",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Brown",
  "Navy Blue",
  "Red",
  "Green",
  "Yellow",
  "Pink",
  "Gold",
  "Multi-Color",
];

const SIZE_OPTIONS = ["One Size", "XS", "S", "M", "L", "XL", "XXL"];

const SPEC_PRESETS = [
  { category: "Material Info", name: "Fabric/Material" },
  { category: "Material Info", name: "Care Instructions" },
  { category: "Dimensions", name: "Width" },
  { category: "Dimensions", name: "Height" },
  { category: "Dimensions", name: "Weight" },
];

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();

  // স্টেটসমূহ
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");

  // ইমেজ স্টেট (নতুন ও পুরোনো ছবি হ্যান্ডেল করার জন্য)
  const [photo, setPhoto] = useState("");
  const [extraPhotos, setExtraPhotos] = useState([]);

  // ক্লাউডিনারি থেকে আসা পুরোনো ছবিগুলো রাখার স্টেট
  const [existingPhoto, setExistingPhoto] = useState("");
  const [existingExtraPhotos, setExistingExtraPhotos] = useState([]);
  const [existingExtraPhotosCount, setExistingExtraPhotosCount] = useState(0);

  // ডাইনামিক ডাটা স্টেট
  const [highlights, setHighlights] = useState([""]);
  const [variants, setVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  // ১. প্রোডাক্টের ডাটা আনা
  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`,
      );
      setName(data.product.name);
      setId(data.product._id);
      setBrand(data.product.brand);
      setDescription(data.product.description);
      setPrice(data.product.price);
      setDiscountPrice(data.product.discountPrice);
      setQuantity(data.product.quantity);
      setShipping(data.product.shipping ? "1" : "0");
      setStatus(data.product.status);
      setCategory(data.product.category._id);

      // Cloudinary ইমেজের ডাটা সেভ করা
      setExistingPhoto(data.product.photo || "");
      setExistingExtraPhotos(data.product.extraPhotos || []);

      // === Highlights Parse Fix ===
      let parsedHighlights = [""];
      if (data.product.highlights) {
        try {
          if (typeof data.product.highlights === "string") {
            parsedHighlights = JSON.parse(data.product.highlights);
          } else if (Array.isArray(data.product.highlights)) {
            if (
              data.product.highlights.length > 0 &&
              typeof data.product.highlights[0] === "string" &&
              data.product.highlights[0].startsWith("[")
            ) {
              parsedHighlights = JSON.parse(data.product.highlights[0]);
            } else {
              parsedHighlights = data.product.highlights;
            }
          }
        } catch (e) {
          parsedHighlights = Array.isArray(data.product.highlights)
            ? data.product.highlights
            : [""];
        }
      }

      setHighlights(parsedHighlights.length > 0 ? parsedHighlights : [""]);
      setVariants(data.product.variants || []);
      setSpecifications(data.product.specifications || []);
      setExistingExtraPhotosCount(data.product.extraPhotos?.length || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleProduct();
    getAllCategory();
    // eslint-disable-next-line
  }, []);

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) setCategories(data?.category || data?.categories);
    } catch (error) {
      toast.error("Error in getting categories");
    }
  };

  // ২. ইমেজ হ্যান্ডেলার
  const handleExtraPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setExtraPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  // ৩. ডাইনামিক ফিল্ড হ্যান্ডেলার
  const handleHighlightChange = (index, value) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };
  const addHighlightRow = () => setHighlights([...highlights, ""]);
  const removeHighlightRow = (index) =>
    setHighlights(highlights.filter((_, i) => i !== index));

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };
  const addSpecRow = (category = "", name = "") =>
    setSpecifications([...specifications, { category, name, value: "" }]);
  const removeSpecRow = (index) =>
    setSpecifications(specifications.filter((_, i) => i !== index));

  // ৪. প্রোডাক্ট আপডেট
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("brand", brand);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("discountPrice", discountPrice);
      productData.append("quantity", quantity);
      productData.append("category", category);
      productData.append("shipping", shipping);
      productData.append("status", status);

      photo && productData.append("photo", photo);

      if (extraPhotos && extraPhotos.length > 0) {
        for (let i = 0; i < extraPhotos.length; i++) {
          productData.append("extraPhotos", extraPhotos[i]);
        }
      }

      // ফাঁকা ডাটা ফিল্টার করে পাঠানো
      productData.append(
        "highlights",
        JSON.stringify(highlights.filter((h) => h.trim() !== "")),
      );
      productData.append("variants", JSON.stringify(variants));
      productData.append(
        "specifications",
        JSON.stringify(
          specifications.filter(
            (s) => s.name.trim() !== "" || s.value.trim() !== "",
          ),
        ),
      );

      const authData = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.put(
        `/api/v1/product/update-product/${id}`,
        productData,
        {
          headers: { Authorization: authData?.token },
        },
      );

      if (data?.success) {
        toast.success("Product Updated Successfully");
        navigate("/dashboard/admin/products");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // ৫. প্রোডাক্ট ডিলিট
  const handleDelete = async () => {
    try {
      let answer = window.confirm(
        "Are you sure you want to delete this product?",
      );
      if (!answer) return;
      const authData = JSON.parse(localStorage.getItem("auth"));
      await axios.delete(`/api/v1/product/delete-product/${id}`, {
        headers: { Authorization: authData?.token },
      });
      toast.success("Product Deleted Successfully");
      navigate("/dashboard/admin/products");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="container dashboard-grid">
          
        <div className="content-area">
          <h1 className="page-title">Update Product Details</h1>
          <form className="product-form-card" onSubmit={handleUpdate}>
            {/* --- ফটো সেকশন (Cloudinary Fixes) --- */}
            <div className="form-row image-update-section">
              <div className="form-group photo-upload-box">
                <label>Main Photo</label>
                <div className="current-img-preview">
                  {photo ? (
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="new-main"
                      className="img-thumbnail-update"
                    />
                  ) : existingPhoto ? (
                    <img
                      src={
                        existingPhoto.startsWith("http")
                          ? existingPhoto
                          : `/api/v1/product/product-photo/${id}`
                      }
                      alt="current-main"
                      className="img-thumbnail-update"
                    />
                  ) : id ? (
                    <img
                      src={`/api/v1/product/product-photo/${id}`}
                      alt="fallback-main"
                      className="img-thumbnail-update"
                    />
                  ) : null}
                </div>
                <label className="custom-file-upload mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                  />
                  📸 Change Main Image
                </label>
              </div>

              <div className="form-group gallery-upload-box">
                <label>Gallery Images (New will replace old)</label>
                <div className="extra-photos-grid">
                  {extraPhotos.length > 0
                    ? extraPhotos.map((file, index) => (
                        <div
                          key={index}
                          className="preview-item"
                          style={{ position: "relative" }}
                        >
                          <img src={URL.createObjectURL(file)} alt="extra" />
                          <button
                            type="button"
                            className="btn-remove-photo"
                            onClick={() =>
                              setExtraPhotos(
                                extraPhotos.filter((_, i) => i !== index),
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    : existingExtraPhotos && existingExtraPhotos.length > 0
                      ? existingExtraPhotos.map((url, i) => (
                          <div
                            key={i}
                            className="preview-item"
                            style={{ position: "relative" }}
                          >
                            <img
                              src={
                                url.startsWith("http")
                                  ? url
                                  : `/api/v1/product/extra-photo/${id}/${i}`
                              }
                              alt="existing"
                            />
                            {/* ইনডেক্স দেখানোর ব্যাজ */}
                            <span
                              style={{
                                position: "absolute",
                                bottom: "0",
                                left: "0",
                                background: "rgba(0,0,0,0.6)",
                                color: "white",
                                fontSize: "10px",
                                padding: "2px 4px",
                                borderBottomLeftRadius: "6px",
                              }}
                            >
                              Index: {i}
                            </span>
                          </div>
                        ))
                      : [...Array(existingExtraPhotosCount)].map((_, i) => (
                          <div key={i} className="preview-item">
                            <img
                              src={`/api/v1/product/extra-photo/${id}/${i}`}
                              alt="fallback-existing"
                            />
                          </div>
                        ))}
                </div>
                <label
                  className="custom-file-upload mt-2"
                  style={{ borderColor: "#28a745" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleExtraPhotoUpload}
                    hidden
                  />
                  ➕ Replace Gallery Photos
                </label>
              </div>
            </div>

            {/* --- বেসিক ডাটা --- */}
            <div className="form-row">
              <div className="form-group">
                <label>Brand Name</label>
                <select
                  className="form-control"
                  value={brand || ""}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Select Brand</option>
                  {BRAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name || ""}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={category || ""}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={status || ""}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Base Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={price || ""}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={discountPrice || ""}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* --- হাইলাইটস (Quick Features) --- */}
            <div className="variant-box p-3 mb-4">
              <h6>Quick Highlights (e.g. Premium Leather, UV Protection)</h6>
              {highlights.map((h, i) => (
                <div key={i} className="mb-2 d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Highlight ${i + 1}`}
                    value={h || ""}
                    onChange={(e) => handleHighlightChange(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeHighlightRow(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-dark mt-1"
                onClick={addHighlightRow}
              >
                + Add Feature
              </button>
            </div>

            {/* --- ভেরিয়েন্ট এডিট (Fashion Dropdowns & Photo Index) --- */}
            <div className="variant-box p-3 mb-4">
              <h6>Edit Variants (Size, Color, Material, Style, Photo Index)</h6>
              {variants.map((v, i) => (
                <div key={i} className="variant-grid-row mb-2">
                  <select
                    className="form-control"
                    value={v.size || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "size", e.target.value)
                    }
                  >
                    <option value="">Select Size</option>
                    {SIZE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    value={v.color || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "color", e.target.value)
                    }
                  >
                    <option value="">Select Color</option>
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Material"
                    value={v.material || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "material", e.target.value)
                    }
                  />

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Style"
                    value={v.style || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "style", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={v.price || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "price", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Stock"
                    value={v.stock || ""}
                    onChange={(e) =>
                      handleVariantChange(i, "stock", e.target.value)
                    }
                  />

                  {/* Photo Index Input (নতুন যোগ করা হয়েছে) */}
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Photo Idx (0,1..)"
                    title="Enter the index number of the extra photo (0 for first, 1 for second). Leave empty for main photo."
                    value={v.photoIndex !== undefined ? v.photoIndex : ""}
                    onChange={(e) =>
                      handleVariantChange(i, "photoIndex", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() =>
                      setVariants(variants.filter((_, idx) => idx !== i))
                    }
                    style={{ padding: "8px 12px", height: "fit-content" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-dark mt-1"
                onClick={() =>
                  setVariants([
                    ...variants,
                    {
                      size: "",
                      color: "",
                      material: "",
                      style: "",
                      price: "",
                      stock: "",
                      photoIndex: "", // নতুন ভেরিয়েন্টে ফিল্ডটি যোগ করা হলো
                    },
                  ])
                }
              >
                + Add Variant
              </button>
            </div>

            {/* --- স্পেসিফিকেশন (Technical Specs) --- */}
            <div className="spec-box p-3 mb-4">
              <h6>Product Specifications</h6>
              <div className="spec-presets mb-3">
                <span className="text-muted" style={{ fontSize: "12px" }}>
                  Quick Add:{" "}
                </span>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {SPEC_PRESETS.map((p, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-sm btn-info text-white"
                      onClick={() => addSpecRow(p.category, p.name)}
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {specifications.map((s, i) => (
                <div key={i} className="row g-2 mb-2 align-items-center">
                  <div className="col-md-3">
                    <input
                      className="form-control"
                      placeholder="Category"
                      value={s.category || ""}
                      onChange={(e) =>
                        handleSpecChange(i, "category", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Name"
                      value={s.name || ""}
                      onChange={(e) =>
                        handleSpecChange(i, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Value (e.g. Leather)"
                      value={s.value || ""}
                      onChange={(e) =>
                        handleSpecChange(i, "value", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => removeSpecRow(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-1"
                onClick={() => addSpecRow()}
              >
                + Add Spec Row
              </button>
            </div>

            {/* --- ডেসক্রিপশন --- */}
            <div className="form-group mb-5">
              <label>Detailed Description</label>
              <ReactQuill
                theme="snow"
                value={description || ""}
                onChange={setDescription}
                style={{ height: "250px" }}
              />
            </div>

            {/* সাবমিট এবং ডিলিট বাটন */}
            <div className="d-flex gap-3 mt-4 action-buttons-group">
              <button type="submit" className="btn-submit flex-grow-1">
                UPDATE PRODUCT
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
              >
                DELETE
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateProduct;
