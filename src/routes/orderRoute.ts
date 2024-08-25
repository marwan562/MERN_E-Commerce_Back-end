import express from "express";
import { createOrder ,findOrder} from "../controllers/orderController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.get("/findOrder",checkJwt , findOrder)
router.post("/createOrder",  checkJwt, createOrder);

export default router;