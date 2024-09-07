import { StrictAuthProp, WithAuthProp } from "@clerk/clerk-sdk-node";
import { NextFunction, Request, Response } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import {
  parseISO,
  startOfDay,
  endOfDay,
  subWeeks,
  subMonths,
  subMonths as subMonthsFunc,
  subYears,
} from "date-fns";

import "dotenv/config";
import AppError from "../utils/AppError";
import User from "../models/UserModel";
import Order from "../models/OrderModel";
import { uploadImageUrl } from "../utils/uploadImageUrl";

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

export const createUser = async (
  req: WithAuthProp<Request>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return next(new AppError("User ID not found in request!", 400));
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser) {
      return next(new AppError("User not found in Clerk!", 404));
    }

    let user = await User.findOne({ authId: userId });

    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      user = await User.create({
        authId: userId,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email,
        imageUrl: clerkUser.imageUrl,
        phoneMobile: "",
        role: "user",
      });

      return res.status(201).json({ user });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { page = 1, pageSize = 10, status, duration } = req.query;

  try {
    if (!id) {
      return next(new AppError("User Id not found", 404));
    }

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    const query: any = { userId: id };

    if (status) {
      query["status"] = status;
    }

    if (duration) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = endOfDay(now);

      switch (duration) {
        case "this week":
          startDate = startOfDay(subWeeks(now, 1));
          break;
        case "this month":
          startDate = startOfDay(subMonths(now, 1));
          break;
        case "last 3 months":
          startDate = startOfDay(subMonths(now, 3));
          break;
        case "last 6 months":
          startDate = startOfDay(subMonths(now, 6));
          break;
        case "this year":
          startDate = startOfDay(new Date(now.getFullYear(), 0, 1));
          break;
        default:
          startDate = startOfDay(new Date(0));
      }

      query["createdAt"] = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query)
      .skip((pageNumber - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    const totalPages = Math.ceil(totalOrders / size);

    res.status(200).json({
      orders,
      pagination: {
        totalOrders,
        totalPages,
        page: pageNumber,
        pageSize: size,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyOrder = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("order not found", 404));
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const uesrId = req.userId;
  const { firstName, lastName, email, phoneMobile } = req.body;
  
  try {
    const user = await User.findById(uesrId);

    if (!user) {
      return next(new AppError("uesr not found ", 404));
    }

    if (user?.firstName) user.firstName = firstName;
    if (user?.lastName) user.lastName = lastName;
    if (user?.email) user.email = email;
    if (user?.phoneMobile) user.phoneMobile = phoneMobile;

    await user.save();

    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};

export const updateImageProfile = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const image = req.file;
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("uesr not found ", 404));
    }

    if (image) {
      const url = await uploadImageUrl(image);
      user.imageUrl = url;
    }

    await user.save();

    res.status(200).send({ imageUrl: user.imageUrl });
  } catch (Err) {
    next(Err);
  }
};
