import express from "express";
import {
  createUser,
  getAllOrders,
  updateMyOrder,
  updateUser,
  updateImageProfile,
} from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { upload } from "../config/multer-config";

const router = express.Router();

const uploadImageMulter = upload.single("imageFile");

const clerkMiddleware = ClerkExpressRequireAuth({
  audience: "http://localhost:3000",
  authorizedParties: ["http://localhost:3000"],
  signInUrl: "/login",
  onError: (error) => {
    console.error("Authentication error:", error);
  },
});

router.patch(
  "/updateImageUser",
  checkJwt,
  uploadImageMulter,
  updateImageProfile
);
router.patch("/informationUser", checkJwt, updateUser);
router.post("/createUser", clerkMiddleware, createUser);
router.get("/getAllOrders/:id", checkJwt, getAllOrders);
router.patch("/myOrder/:id", checkJwt, updateMyOrder);

export default router;
