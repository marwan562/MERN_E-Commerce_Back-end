import mongoose, { Document } from "mongoose";

const washlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
});

const Washlist = mongoose.model<Document>("Washlist", washlistSchema);

export default Washlist;
