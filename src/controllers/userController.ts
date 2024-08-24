import { StrictAuthProp, WithAuthProp } from "@clerk/clerk-sdk-node";
import { NextFunction, Request, Response } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import "dotenv/config";
import AppError from "../utils/AppError";
import User from "../models/UserModel";

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
      });

      return res.status(201).json({ user });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
