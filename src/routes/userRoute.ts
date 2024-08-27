import express from "express";
import {
  createUser,
  getAllOrders,
  updateMyOrder,
} from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.post("/createUser", createUser);
router.get("/getAllOrders", checkJwt, getAllOrders);
router.patch("/myOrder/:id", checkJwt, updateMyOrder);

export default router;
