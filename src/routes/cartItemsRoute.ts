import express from "express";
import {
  addCartItem,
  getCartItems,
  updateCartItem,
  deleteItem
} from "../controllers/cartitemsController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

// Add a cart item route
router.post("/addItem", checkJwt, addCartItem);
router.get("/getCartItems", checkJwt, getCartItems);
router.delete("/deleteItem", checkJwt, deleteItem);
router.patch("/updateItem", checkJwt, updateCartItem);

export default router;
