import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Washlist from "../models/Washlist";

const addItem = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    if (!productId) {
      return next(new AppError("ProductId is required", 400));
    }

    let washlist = await Washlist.findOne({ productId, userId });

    if (!washlist) {
      washlist = new Washlist({
        userId,
        productId,
      });
      washlist.save();
    } else {
      await washlist.deleteOne();
    }

    const washlists = await Washlist.find({ userId }).populate("productId");
    res.status(200).send(washlists);
  } catch (err) {
    next(err);
  }
};

const getAll = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const washlist = await Washlist.find({ userId }).populate("productId");

    if (!washlist) {
      return next(
        new AppError("Washlist Not found Or you don't have washlist", 200)
      );
    }
    console.log(washlist);
    res.status(200).send(washlist);
  } catch (err) {
    next(err);
  }
};

export { addItem, getAll };
