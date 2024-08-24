import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: false },
    sessionId: { type: String, required: false },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;
