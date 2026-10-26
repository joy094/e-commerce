// CreateProduct.jsx

import React, { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CreateProduct.css";

const CreateProduct = () => {
  const navigate = useNavigate();

  // বেসিক ডাটা স্টেট
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("0");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [shipping, setShipping] = useState("1");
  const [status, setStatus] = useState("Active");
  const [videoLink, setVideoLink] = useState(""); // 🔴 ভিডিও লিংকের জন্য নতুন স্টেট

  // ইমেজ স্টেট
  const [photo, setPhoto] = useState(null);
  const [extraPhotos, setExtraPhotos] = useState([]);

  // এক্সট্রা ছবি অ্যাড ও রিমুভ করার ফাংশন
  const handleExtraPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setExtraPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  const removeExtraPhoto = (indexToRemove) => {
    setExtraPhotos((prevPhotos) =>
      prevPhotos.filter((_, index) => index !== indexToRemove),
    );
  };

  // ডাইনামিক ডাটা স্টেট
  const [highlights, setHighlights] = useState([""]);

  // === ফ্যাশন রিলেটেড ভেরিয়েন্ট স্টেট ===
  const [variants, setVariants] = useState([
    {
      size: "",
      color: "",
      material: "",
      style: "",
      price: "",
      stock: "",
      photoIndex: "",
    },
  ]);

  // ব্র্যান্ড অপশন
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

  // স্পেসিফিকেশন স্টেট
  const [specifications, setSpecifications] = useState([
    { category: "Material Info", name: "Fabric/Material", value: "" },
  ]);

  // ক্যাটাগরি আনা
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category || data?.categories || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // ডাইনামিক ফিল্ড হ্যান্ডেলার
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

  const addVariantRow = () =>
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        material: "",
        style: "",
        price: "",
        stock: "",
        photoIndex: "",
      },
    ]);

  const removeVariantRow = (index) =>
    setVariants(variants.filter((_, i) => i !== index));

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };
  const addSpecRow = () =>
    setSpecifications([
      ...specifications,
      { category: "", name: "", value: "" },
    ]);
  const removeSpecRow = (index) =>
    setSpecifications(specifications.filter((_, i) => i !== index));

  // ফর্ম সাবমিট
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!photo) return toast.error("Main Photo is required!");

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
      productData.append("videoLink", videoLink); // 🔴 ইউটিউব লিংক অ্যাপেন্ড করা হলো

      // মেইন ছবি
      productData.append("photo", photo);

      // এক্সট্রা ছবি লুপ করে পাঠানো
      if (extraPhotos && extraPhotos.length > 0) {
        for (let i = 0; i < extraPhotos.length; i++) {
          productData.append("extraPhotos", extraPhotos[i]);
        }
      }

      productData.append(
        "highlights",
        JSON.stringify(highlights.filter((h) => h.trim() !== "")),
      );
      productData.append("variants", JSON.stringify(variants));
      productData.append("specifications", JSON.stringify(specifications));

      const authData = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.post(
        "/api/v1/product/create-product",
        productData,
        {
          headers: { Authorization: authData?.token },
        },
      );

      if (data?.success) {
        toast.success("Product Created Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Failed to create product");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="container dashboard-grid">
        <div className="content-area">
          <h1 className="page-title">Add New Product</h1>
          <form className="product-form-card" onSubmit={handleCreate}>
            {/* === ১. ফটো আপলোড ও প্রিভিউ সেকশন === */}
            <div className="form-row">
              <div className="form-group">
                <label>Main Product Image *</label>
                <label className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                    required
                  />
                  {photo
                    ? "✅ Main Photo Selected"
                    : "📸 Click to Upload Main Image"}
                </label>
                {photo && (
                  <div className="mt-2 text-center">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="main preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid #ddd",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Extra Gallery Images</label>
                <label
                  className="custom-file-upload"
                  style={{ borderColor: "#28a745" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleExtraPhotoUpload}
                    hidden
                  />
                  ➕ Add More Images
                </label>
                {extraPhotos && extraPhotos.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {extraPhotos.map((file, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`extra-${index}`}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraPhoto(index)}
                          style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "#ff4d4d",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
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
                          Index: {index}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* === ২. বেসিক ইনফো === */}
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select
                  className="form-control"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Select Brand</option>
                  {BRAND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  className="form-control"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  required
                >
                  <option value="">Select a Category</option>
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
                  onChange={(e) => setStatus(e.target.value)}
                  value={status}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Base Price *</label>
                <input
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Total Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Shipping</label>
                <select
                  className="form-control"
                  onChange={(e) => setShipping(e.target.value)}
                  value={shipping}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>

            {/* === ৩. ইউটিউব ভিডিও লিংক (নতুন) === */}
            <div className="form-group mb-4">
              <label>Product Video Link (YouTube)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
            </div>

            {/* === ৪. হাইলাইটস === */}
            <div className="variant-box p-3 mb-4">
              <h6>Quick Highlights (e.g. Premium Leather, UV Protection)</h6>
              {highlights.map((h, i) => (
                <div key={i} className="mb-2 d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Highlight ${i + 1}`}
                    value={h}
                    onChange={(e) => handleHighlightChange(i, e.target.value)}
                  />
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeHighlightRow(i)}
                    >
                      ✕
                    </button>
                  )}
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

            {/* === ৫. অ্যাডভান্সড ভেরিয়েন্ট (Fashion Options) === */}
            <div className="variant-box p-3 mb-4">
              <h6>Product Variants (Size, Color, Material, Style, Photo)</h6>
              {variants.map((v, i) => (
                <div className="variant-grid-row mb-2" key={i}>
                  <select
                    className="form-control"
                    value={v.size}
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
                    value={v.color}
                    onChange={(e) =>
                      handleVariantChange(i, "color", e.target.value)
                    }
                  >
                    <option value="">Select Color</option>
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Material"
                    value={v.material}
                    onChange={(e) =>
                      handleVariantChange(i, "material", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Style"
                    value={v.style}
                    onChange={(e) =>
                      handleVariantChange(i, "style", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) =>
                      handleVariantChange(i, "price", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) =>
                      handleVariantChange(i, "stock", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Photo Idx (0,1..)"
                    title="Enter the index number of the extra photo (0 for first, 1 for second). Leave empty for main photo."
                    value={v.photoIndex}
                    onChange={(e) =>
                      handleVariantChange(i, "photoIndex", e.target.value)
                    }
                  />

                  {variants.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => removeVariantRow(i)}
                      style={{ padding: "8px 12px", height: "fit-content" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-dark mt-1"
                onClick={addVariantRow}
              >
                + Add Variant
              </button>
            </div>

            {/* === ৬. স্পেসিফিকেশন টেবিল ডাটা === */}
            <div className="spec-box p-3 mb-4">
              <h6>Product Specifications (Table Content)</h6>
              {specifications.map((s, i) => (
                <div key={i} className="row g-2 mb-2">
                  <div className="col-md-3">
                    <input
                      placeholder="Category (e.g. Dimensions)"
                      className="form-control"
                      value={s.category}
                      onChange={(e) =>
                        handleSpecChange(i, "category", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      placeholder="Name (e.g. Weight)"
                      className="form-control"
                      value={s.name}
                      onChange={(e) =>
                        handleSpecChange(i, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      placeholder="Value (e.g. 500g)"
                      className="form-control"
                      value={s.value}
                      onChange={(e) =>
                        handleSpecChange(i, "value", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-1">
                    {specifications.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm w-100"
                        onClick={() => removeSpecRow(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-1"
                onClick={addSpecRow}
              >
                + Add Spec Row
              </button>
            </div>

            {/* === ৭. রিচ টেক্সট এডিটর === */}
            <div className="form-group mb-5">
              <label>Detailed Description</label>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                style={{ height: "250px" }}
              />
            </div>

            <button type="submit" className="btn-submit">
              PUBLISH PRODUCT
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProduct;
