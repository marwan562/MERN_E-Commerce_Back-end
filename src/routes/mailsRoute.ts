import express from "express";
import {
  createMyMail,
  getMyMails,
  deleteMyMail,
  updateMyMail,
  findMyEmailByOrderId,
  getAllMailsReceived,
} from "../controllers/mailsController";
import { upload } from "../config/multer-config";
import { checkJwt } from "../middlewares/checkJwt";

const uploadImageMulter = upload.single("imageFile");

const router = express.Router();

router.get("/getAllMyMails", checkJwt, getMyMails);
router.get("/findMyEmailByOrderId", checkJwt, findMyEmailByOrderId);
router.delete("/removeMyMail/:id", checkJwt, deleteMyMail);
router.patch("/:id", checkJwt, uploadImageMulter, updateMyMail);
router.post("/", checkJwt, uploadImageMulter, createMyMail);

//get all mails for user
router.get("/getAllMailsReceived" , checkJwt, getAllMailsReceived);
export default router;
