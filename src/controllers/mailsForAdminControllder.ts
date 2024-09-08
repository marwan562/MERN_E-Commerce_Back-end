import { NextFunction, Request, Response } from "express";
import User from "../models/UserModel";
import AppError from "../utils/AppError";
import Mail from "../models/MailModel";

interface CustomRequest extends Request {
  userId?: string;
}

export const getAllMails = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
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

  try {
    const admin = await User.findById(userId);

    if (admin?.role !== "admin") {
      return next(new AppError("Protected route. Only for admins.", 400));
    }

    let query: any = {};

    if (search) {
      query["subject"] = searchRegExp;
    }

    if (filterMailType && filterMailType !== "all") {
      console.log(filterMailType);
      query["mailType"] = filterMailType;
    }

    if (filterStatus && filterStatus !== "all") {
      query["status"] = filterStatus;
    }

    const mails = await Mail.find(query)
      .populate("userId")
      .populate({
        path: "replies.user",
        select: "firstName lastName imageUrl isRead role createdAt",
      })
      .limit(pageSizeNumber)
      .skip((pageNumber - 1) * pageSizeNumber)
      .exec();

    const totalMails = await Mail.countDocuments(query);
    const totalPages = Math.ceil(totalMails / pageSizeNumber);

    if (!mails || mails.length === 0) {
      return res
        .status(200)
        .send({
          mails: [],
          pagination: {
            page: 1,
            pageSize: 10,
            totalMails: 0,
            totalPages: 1,
          },
        })
        .status(404);
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

export const replayMailToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mailId } = req.params;
  const { user, content } = req.body;

  try {
    if (!user || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mail = await Mail.findByIdAndUpdate(
      mailId,
      {
        adminId: user,
        $push: {
          replies: {
            user,
            content,
          },
        },
      },
      { new: true }
    )
      .populate({
        path: "replies.user",
        select: "firstName lastName isRead imageUrl role createdAt",
      })
      .exec();

    if (!mail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    res.status(200).json({ mail });
  } catch (error) {
    console.error("Error in replayMailToUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
    next(error);
  }
};

export const updateReadMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mailId } = req.params;
  const { userId } = req.body;

  try {
    const mail = await Mail.findById(mailId).populate("userId").populate({
      path: "replies.user",
      select: "firstName lastName imageUrl isRead role createdAt",
    });

    if (!mail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    const isAdmin = mail.adminId ? mail.adminId.equals(userId) : false;

    mail.replies.forEach((reply) => {
      if (isAdmin) {
        if (reply.user._id.equals(mail.userId)) {
          reply.isRead = true;
        }
      } else {
        if (reply.user._id.equals(mail.adminId)) {
          reply.isRead = false;
        }
      }
    });

    mail.status = "read";

    await mail.save();

    res.status(200).json({ mail });
  } catch (err) {
    next(err);
  }
};
