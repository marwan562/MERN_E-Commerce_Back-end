import { NextFunction, Request, Response } from "express";
import Product from "../models/ProductsModel";
import AppError from "../utils/AppError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return next(new AppError("products not found", 404));
    }
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.productId 

    const product = await Product.findById(productId).populate("category")

    if (!product) {
      return next(new AppError("product not found.",404))
    }

    res.status(200).send(product)
  } catch (err) {
    next(err);
  }
};
