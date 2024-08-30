import express from "express";
import {
  createUser,
  getAllOrders,
  updateMyOrder,
} from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

const clerkMiddleware =  ClerkExpressRequireAuth({
  audience: "http://localhost:3000",
  authorizedParties: ["http://localhost:3000"],
  signInUrl: "/login",
  onError: (error) => {
    console.error("Authentication error:", error);
  },
})

router.post("/createUser" ,clerkMiddleware, createUser);
router.get("/getAllOrders/:id" , checkJwt, getAllOrders);
router.patch("/myOrder/:id", checkJwt, updateMyOrder);

export default router;
