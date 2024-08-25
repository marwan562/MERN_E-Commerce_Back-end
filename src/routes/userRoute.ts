import express from "express";
import { createUser ,getAllOrders } from "../controllers/userController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.post("/createUser", createUser);
router.get("/getAllOrders", checkJwt, getAllOrders);


export default router;
