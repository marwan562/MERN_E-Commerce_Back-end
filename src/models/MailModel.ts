import mongoose, { Schema, Document } from "mongoose";

type TReplies = {
  user: any;
  isRead: boolean;
  userId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
};

interface IEmail extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status: "read" | "unread";
  mailType: "orderConfigration" | "shippingNotification" | "customerInquiry";
  image: string;
  replies: TReplies[];
}

const repliesSchema = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isRead: { type: Boolean, default: false },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
};

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
    replies: [repliesSchema],
  },
  {
    timestamps: true,
  }
);

const Mail = mongoose.model<IEmail>("Mail", mailSchema);

export default Mail;
