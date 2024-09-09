import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import Mail from "../models/MailModel";
import { uploadImageUrl } from "../utils/uploadImageUrl";

export const createMyMail = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const image = req.file;
  const userId = req.userId;
  const { orderId, subject, body, mailType } = req.body;

  try {
    if (
      !mongoose.isValidObjectId(orderId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return next(new AppError("Invalid Order ID or User ID", 400));
    }

    if (!subject || !body || !mailType) {
      return next(new AppError("Feilds is Subject Or  Body  required", 400));
    }

    const url = await uploadImageUrl(image as Express.Multer.File);

    const mail = new Mail({
      orderId,
      userId,
      subject,
      body,
      mailType,
      status: "unread",
      image: url,
    });

    await mail.save();

    res.status(201).json({ mail });
  } catch (error) {
    next(error);
  }
};

export const updateMyMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { orderId, userId, subject, body, mailType } = req.body;
  const image = req.file;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError("Invalid Mail ID", 400));
    }

    const mail = await Mail.findById(id);

    if (!mail) {
      return next(new AppError("Mail not found", 404));
    }

    if (image) {
      mail.image = await uploadImageUrl(image as Express.Multer.File);
    }

    if (orderId && mongoose.isValidObjectId(orderId))
      mail.orderId = new mongoose.Types.ObjectId(orderId);
    if (userId && mongoose.isValidObjectId(userId))
      mail.userId = new mongoose.Types.ObjectId(userId);
    if (subject) mail.subject = subject;
    if (body) mail.body = body;
    if (mailType) mail.mailType = mailType;

    const updatedMail = await mail.save();

    res.status(200).json(updatedMail);
  } catch (error) {
    next(error);
  }
};

export const deleteMyMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError("Invalid Mail ID", 400));
    }

    const mail = await Mail.findByIdAndDelete(id);

    if (!mail) {
      return next(new AppError("Mail not found", 404));
    }

    res.status(200).json({ mail });
  } catch (error) {
    next(error);
  }
};

export const getMyMails = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const {
    page = 1,
    pageSize = 10,
    search = "",
    filterStatus = "all",
    filterMailType = "all",
  } = req.query;

  try {
    const pageNumber = parseInt(page.toString(), 10) || 1;
    const pageSizeNumber = parseInt(pageSize.toString(), 10) || 10;

    let querys: any = { userId };

    if (search) {
      const searchRegExp = new RegExp(search.toString(), "i");
      querys["subject"] = searchRegExp;
    }

    if (filterStatus && filterStatus !== "all") {
      querys["status"] = filterStatus;
    }

    if (filterMailType && filterMailType !== "all") {
      querys["mailType"] = filterMailType;
    }

    const mails = await Mail.find(querys)
      .limit(pageSizeNumber)
      .skip((pageNumber - 1) * pageSizeNumber);

    const totalMails = await Mail.countDocuments(querys);
    const totalPages = Math.ceil(totalMails / pageSizeNumber);

    res.status(200).json({
      mails,
      pagination: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        totalMails,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const findMyEmailByOrderId = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const { orderId } = req.query;
  console.log(orderId);

  try {
    const mail = await Mail.findOne({ orderId, userId });

    if (!mail) {
      return next(new AppError("Mail don't found", 404));
    }

    res.status(200).send({ mail });
  } catch (err) {
    next(err);
  }
};

export const getAllMailsReceived = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    const {
      page = 1,
      pageSize = 10,
      search = "",
      filterMailType,
      filterStatus,
    } = req.query;

    const pageNumber = parseInt(page.toString(), 10);
    const pageSizeNumber = parseInt(pageSize.toString(), 10);
    const searchRegExp = new RegExp(search.toString(), "i");

    let query: any = { userId, adminId: { $exists: true } };

    if (search) {
      query["subject"] = searchRegExp; 
    }

    if (filterMailType && filterMailType !== "all") {
      query["mailType"] = filterMailType; 
    }

    if (filterStatus && filterStatus !== "all") {
      query["status"] = filterStatus; 
    }

    const mails = await Mail.find(query)
      .populate("userId adminId")
      .populate({ path: "replies.user", select: "firstName lastName imageUrl isRead role createdAt" })
      .limit(pageSizeNumber)
      .skip((pageNumber - 1) * pageSizeNumber)
      .exec();

    const totalMails = await Mail.countDocuments(query);
    const totalPages = Math.ceil(totalMails / pageSizeNumber);

    if (!mails || mails.length === 0) {
      return res.status(200).json({
        mails: [],
        pagination: {
          page: pageNumber,
          pageSize: pageSizeNumber,
          totalMails: 0,
          totalPages: 1,
        },
      });
    }

    res.status(200).json({
      mails,
      pagination: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        totalMails,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

