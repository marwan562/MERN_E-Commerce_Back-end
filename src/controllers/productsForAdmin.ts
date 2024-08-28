import { NextFunction, Request, Response } from "express";
import Product from "../models/ProductsModel";
import mongoose from "mongoose";
import Category from "../models/CategoryModel";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      pageSize = "10",
      search = "",
      category,
      role,
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    const query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "all") {
      if (mongoose.Types.ObjectId.isValid(category as string)) {
        query.category = new mongoose.Types.ObjectId(category as string);
      } else {
        const categoryDoc = await Category.findOne({ title: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          query.category = null;
        }
      }
    }

    const skip = (pageNumber - 1) * size;

    const products = await Product.find(query)
      .populate("category")
      .skip(skip)
      .limit(size)
      .exec();

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / size);

    res.status(200).json({
      products,
      pagination: {
        totalProducts: total,
        totalPages,
        page: pageNumber,
        pageSize: size,
      },
    });
  } catch (err) {
    next(err);
  }
};
