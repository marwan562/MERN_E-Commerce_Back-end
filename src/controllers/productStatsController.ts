import { NextFunction, Request, Response } from "express";
import ProductStat from "../models/ProductStat";
import AppError from "../utils/AppError";
import Product from "../models/ProductsModel";
import mongoose from "mongoose";
import User from "../models/UserModel";
import Order from "../models/OrderModel";

export const getProductStatsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const productStats = await ProductStat.findOne({ productId: id });

    if (!productStats) {
      return next(new AppError("product stats not found", 404));
    }

    res.status(200).send(productStats);
  } catch (err) {
    next(err);
  }
};

// Get product stats by category
export const productStatsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { categoryId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new AppError("Invalid category ID", 401));
    }

    const products = await Product.find({ category: categoryId });

    if (!products.length) {
      return next(new AppError("No products found in this category", 404));
    }

    const productIds = products.map((product) => product._id);

    const productStats = await ProductStat.find({
      productId: { $in: productIds },
    }).populate("productId");

    res.status(200).json(productStats);
  } catch (err) {
    next(err);
  }
};

export const overViewDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0) {
      return next(new AppError("User not found.", 404));
    }

    const totalOrders = await Order.countDocuments();
    if (totalOrders === 0) {
      return next(new AppError("User not found.", 404));
    }

    const totalPriceOrders = await (
      await Order.find()
    ).reduce((acc, order) => {
      const total = acc + order.totalAmount;
      return total;
    }, 0);

    if (totalPriceOrders === 0) {
      return next(new AppError("Orders not found.", 404));
    }

    res.status(200).send({ totalUsers, totalOrders, totalPriceOrders });
  } catch (err) {
    next(err);
  }
};
