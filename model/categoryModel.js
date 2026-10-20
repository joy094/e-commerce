import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  slug: { 
    type: String, 
    lowercase: true 
  },
  icon: { 
    type: String, 
    default: "fa-solid fa-folder" // আইকন না দিলে ডিফল্টভাবে এই আইকনটি সেট হবে
  },
});

export default mongoose.model("Category", categorySchema);