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

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

// const getUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = 
//   } catch (err) {
//     next(err)
//   }
// };

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
      });

      return res.status(201).json({ user });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const { page = 1, pageSize = 10, status, duration } = req.query;

  try {
    if (!userId) {
      return next(new AppError("User Id not found", 404));
    }

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    const query: any = { userId };

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
