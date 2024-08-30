import express from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { upload } from "../config/multer-config";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from "../controllers/categoriesForAdmin";

import {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/productsForAdmin";

import {
  getProductStatsById,
  productStatsByCategory,
  overViewDashboard,
} from "../controllers/productStatsController";
import {
  deleteUser,
  getAllCustomers,
  updateRoleCustomer,
} from "../controllers/customersController";

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
router.post("/createProduct", checkJwt, uploadImageMulter, createProduct);
router.patch("/updateProduct/:id", checkJwt, uploadImageMulter, updateProduct);
router.delete("/deleteProduct/:id", checkJwt, deleteProduct);

//productStats
router.get("/productStats/:id", checkJwt, getProductStatsById);
router.get(
  "/proudctStatsByCategory/:categoryId",
  checkJwt,
  productStatsByCategory
);

//overview admin dashboard
router.get("/overview", checkJwt, overViewDashboard);

//customers for admin dashboard
router.get("/customers", checkJwt, getAllCustomers);
router.patch("/updateUser/:id", checkJwt, updateRoleCustomer);
router.delete("/deleteUser/:id", checkJwt, deleteUser);

export default router;
