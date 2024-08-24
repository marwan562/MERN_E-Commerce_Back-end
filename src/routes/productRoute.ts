import express from "express"
import {getAll , getProductById} from "../controllers/productController"


const router = express.Router()


router.get("/getAll",getAll)
router.get("/details/:productId",getProductById)


export default router