import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { toast } from "react-toastify";
import "./CreateLandingPage.css";

const CreateLandingPage = () => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // ফর্মের ডেটা স্টেট
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("cod-sales");
  const [customContent, setCustomContent] = useState({
    headline: "",
    subHeadline: "",
    offerPrice: "",
  });
  const navigate = useNavigate();

  // ১. প্রোডাক্টগুলো ফেচ করা (Step 1 এর জন্য)
  const getAllProducts = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/get-product");
      if (data?.success) {
        setProducts(data.products);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // ২. ল্যান্ডিং পেজ পাবলিশ করা (Step 5)
  const handlePublish = async () => {
    try {
      const { data } = await axios.post("/api/v1/landing-page/create", {
        product: selectedProduct._id,
        template: selectedTemplate,
        customContent: {
          ...customContent,
          offerPrice: Number(customContent.offerPrice),
        },
        status: "published",
      });

      if (data.success) {
        toast.success("Landing Page Published Successfully!");
        // পাবলিশ হওয়ার পর 리সেট করা
        setStep(1);
        setSelectedProduct(null);
        setCustomContent({ headline: "", subHeadline: "", offerPrice: "" });
      }
    } catch (error) {
      toast.error("Error publishing landing page");
    }
  };

  return (
    <div className="container-fluid m-3 p-3">
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-9 builder-main-area">
          <div className="builder-header">
            <div>
              <h2>Landing Page Builder</h2>
              <p>
                Create, edit and publish high-converting product landing pages.
              </p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => navigate("/dashboard/admin/landing-pages")}
            >
              View All Landing Pages
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="stepper-wrapper">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`stepper-item ${step === s ? "active" : ""} ${step > s ? "completed" : ""}`}
              >
                <div className="step-counter">{s}</div>
                <div className="step-name">
                  {s === 1 && "Select Product"}
                  {s === 2 && "Choose Template"}
                  {s === 3 && "Edit Design"}
                  {s === 4 && "Preview"}
                  {s === 5 && "Publish"}
                </div>
              </div>
            ))}
          </div>

          {/* ================= STEP 1: Select Product ================= */}
          {step === 1 && (
            <div className="step-content">
              <h4>1. Select Product</h4>
              <p>Choose a product from your existing product list</p>

              <input
                type="text"
                className="form-control mb-3 search-input"
                placeholder="Search product by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="product-list-container">
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <div
                      key={p._id}
                      className={`product-select-card ${selectedProduct?._id === p._id ? "selected" : ""}`}
                      onClick={() => setSelectedProduct(p)}
                    >
                      <input
                        type="radio"
                        checked={selectedProduct?._id === p._id}
                        readOnly
                      />
                      <img
                        src={`/api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                      />
                      <div className="product-info">
                        <h6>{p.name}</h6>
                        <span className="price">৳ {p.price}</span>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                className="btn-next mt-4"
                disabled={!selectedProduct}
                onClick={() => setStep(2)}
              >
                Next Step
              </button>
            </div>
          )}

          {/* ================= STEP 2: Choose Template ================= */}
          {step === 2 && (
            <div className="step-content">
              <h4>2. Choose Template</h4>
              <div className="template-grid">
                <div
                  className={`template-card ${selectedTemplate === "product-offer" ? "selected" : ""}`}
                  onClick={() => setSelectedTemplate("product-offer")}
                >
                  <div className="template-preview">Product Offer</div>
                  <h6>Product Offer</h6>
                  <p>Best for single product with special offer</p>
                </div>

                <div
                  className={`template-card ${selectedTemplate === "cod-sales" ? "selected" : ""}`}
                  onClick={() => setSelectedTemplate("cod-sales")}
                >
                  <div className="template-preview">COD Sales Page</div>
                  <h6>COD Sales Page</h6>
                  <p>Best for COD and social media ads</p>
                </div>

                <div
                  className={`template-card ${selectedTemplate === "minimal-product" ? "selected" : ""}`}
                  onClick={() => setSelectedTemplate("minimal-product")}
                >
                  <div className="template-preview">Minimal Layout</div>
                  <h6>Minimal Product</h6>
                  <p>Clean and modern layout</p>
                </div>
              </div>
              <div className="action-buttons mt-4">
                <button className="btn-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn-next" onClick={() => setStep(3)}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: Edit Design ================= */}
          {step === 3 && (
            <div className="step-content">
              <h4>3. Edit Design & Content</h4>
              <p>
                Customize content for: <strong>{selectedProduct?.name}</strong>
              </p>

              <div className="form-group mb-3">
                <label>Catchy Headline (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. স্টক ফুরানোর আগেই অর্ডার করুন!"
                  value={customContent.headline}
                  onChange={(e) =>
                    setCustomContent({
                      ...customContent,
                      headline: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group mb-3">
                <label>Special Offer Price (৳)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Current Price: ${selectedProduct?.price}`}
                  value={customContent.offerPrice}
                  onChange={(e) =>
                    setCustomContent({
                      ...customContent,
                      offerPrice: e.target.value,
                    })
                  }
                />
              </div>

              <div className="action-buttons mt-4">
                <button className="btn-back" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="btn-next" onClick={() => setStep(4)}>
                  Preview
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: Preview ================= */}
          {step === 4 && (
            <div className="step-content">
              <h4>4. Preview Landing Page</h4>
              <div className="preview-box">
                <h5>{customContent.headline || selectedProduct?.name}</h5>
                <img
                  src={`/api/v1/product/product-photo/${selectedProduct?._id}`}
                  style={{ width: "150px" }}
                  alt="preview"
                />
                <h3 className="text-danger mt-2">
                  ৳ {customContent.offerPrice || selectedProduct?.price}
                </h3>
                <button className="btn btn-danger w-50 mt-3">
                  Order Now (Demo)
                </button>
              </div>

              <div className="action-buttons mt-4">
                <button className="btn-back" onClick={() => setStep(3)}>
                  Back
                </button>
                <button className="btn-next" onClick={() => setStep(5)}>
                  Next: Publish
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: Publish ================= */}
          {step === 5 && (
            <div className="step-content text-center">
              <h4>5. Ready to Publish</h4>
              <p>
                Your landing page for <strong>{selectedProduct?.name}</strong>{" "}
                is ready to go live.
              </p>

              <div className="action-buttons justify-content-center mt-4">
                <button className="btn-back" onClick={() => setStep(4)}>
                  Back to Edit
                </button>
                <button className="btn-publish" onClick={handlePublish}>
                  🚀 Publish Landing Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLandingPage;
