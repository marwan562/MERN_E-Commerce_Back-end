import express from "express";
import { createOrder ,findOrder , getAllOrders,updateOrderStatus} from "../controllers/orderController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.get("/findOrder",checkJwt , findOrder)
router.get("/getAllOrders",checkJwt , getAllOrders)
router.patch("/updateOrder/:orderId",  checkJwt, updateOrderStatus);
router.post("/createOrder",  checkJwt, createOrder);

export default router;  