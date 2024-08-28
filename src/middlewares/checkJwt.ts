import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import AppError from "../utils/AppError";

interface TReq extends Request {
  userId?: string;
}

export const checkJwt = async (
  req: TReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.split(" ")[1];
      const decoded = jwt.decode(token);
      const authId = (decoded as any)?.sub;

      // Assuming your JWT payload contains a userId
      const user = await User.findOne({ authId });

      if (user) {
        req.userId = user._id.toString();
        console.log("userId jwt", req.userId);
      } else {
        return next(new AppError("User not found", 404));
      }
    }
    next();
  } catch (err) {
    next(err); // Continue as guest if JWT verification fails
  }
};
