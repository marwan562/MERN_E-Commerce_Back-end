import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    img: { type: String, required: true },
    stock: { type: Number, required: true },
    role: { type: String, enum: ["New", "Sale", ""] },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
