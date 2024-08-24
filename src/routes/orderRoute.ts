import express, { NextFunction, Request } from "express";
import { createOrder } from "../controllers/orderController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.post("/createOrder", (req:Request,res,next:NextFunction) => {
    console.log(req.auth)
    next()
},  checkJwt, createOrder);

export default router;