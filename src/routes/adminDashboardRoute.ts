import express from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { upload } from "../config/multer-config";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from "../controllers/categoriesForAdmin";
import { getAllProducts } from "../controllers/productsForAdmin";

const router = express.Router();

const uploadImageMulter = upload.single("imageFile");

//categories for admin
router.get("/categories", checkJwt, getAllCategories);
router.post("/categories", checkJwt, uploadImageMulter, createCategory);
router.delete("/deleteCategory/:id", checkJwt, removeCategory);
router.patch(
  "/updateCategory/:id",
  checkJwt,
  uploadImageMulter,
  updateCategory
);
//proudct for admin
router.get("/products", checkJwt, getAllProducts);

export default router;
