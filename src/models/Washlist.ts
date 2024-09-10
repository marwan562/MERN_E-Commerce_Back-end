import mongoose, { Document, Schema } from "mongoose";

interface IWashlist extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
}

const washlistSchema = new Schema<IWashlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

const Washlist = mongoose.model<IWashlist>("Washlist", washlistSchema);

export default Washlist;
