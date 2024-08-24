import express from "express";
import { addItem, getAll } from "../controllers/washlistController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();

router.post("/addItem", checkJwt, addItem);
router.get("/getAll", checkJwt, getAll);

export default router;
