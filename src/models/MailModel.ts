import mongoose, { Schema, Document } from "mongoose";

interface IEmail extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status: "read" | "unread";
  mailType: "orderConfigration" | "shippingNotification" | "customerInquiry";
  image: string;
}

const mailSchema = new Schema<IEmail>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
    mailType: {
      type: String,
      enum: ["orderConfigration", "shippingNotification", "customerInquiry"],
      required: true,
    },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

const Mail = mongoose.model<IEmail>("Mail", mailSchema);

export default Mail;
