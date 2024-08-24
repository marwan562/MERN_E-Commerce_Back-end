import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    authId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String },
    imageUrl: { type: String },
    phoneMobile:Number,
    role: {
      type: String,
      enum: ["admin", "user", "superAdmin"],
      default: "user",
    },
  },
  { timestamps: true } // Enables createdAt and updatedAt fields
);

const User = mongoose.model("User", userSchema);

export default User;
