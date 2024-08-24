import express from "express"
import {getAll ,getProductByCat} from "../controllers/categoryController"

const router = express.Router()


router.get("/getAll",getAll)
router.get("/:catPrefix" , getProductByCat)

export default router