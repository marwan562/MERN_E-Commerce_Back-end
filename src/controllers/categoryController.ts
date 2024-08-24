import { Request, Response, NextFunction } from "express";
import Category from "../models/CategoryModel";
import AppError from "../utils/AppError";
import Product from "../models/ProductsModel";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find();

    if (categories.length === 0) {
      return next(new AppError("Categories not found or empty", 404));
    }

    return res.status(200).json(categories);
  } catch (err) {
    const error =
      err instanceof AppError
        ? err
        : new AppError("Internal Server Error", 500);
    next(error);
  }
};

export const getProductByCat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { catPrefix } = req.params;

    if (!catPrefix) {
      return next(new AppError("CarPrefix is required", 400));
    }

    const products = await Category.findOne({ title: catPrefix }).populate(
      "products"
    );

    res.status(200).send(products?.products);
  } catch (err) {
    next(err);
  }
};
