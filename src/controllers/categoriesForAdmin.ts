import { NextFunction, Request, Response } from "express";
import Category from "../models/CategoryModel";
import AppError from "../utils/AppError";
import { uploadImageUrl } from "../utils/uploadImageUrl";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find().populate("products");

    if (!categories) {
      return next(new AppError("categories not found ", 404));
    }

    res.status(200).send(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const image = req.file;
    const { title } = req.body;

    if (!image || !title) {
      return next(new AppError("Feilds is required.", 400));
    }

    const uploadResponse = await uploadImageUrl(image);

    const category = new Category({
      title,
      products: [],
      img: uploadResponse,
    });

    await category.save();

    res.status(200).send(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const image = req.file;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError("Category not found.", 404));
    }

    category.title = title;

    if (image) {
      const uploadResponse = await uploadImageUrl(image);
      category.img = uploadResponse;
    }

    await category.save();

    res.status(200).send(category);
  } catch (err) {
    next(err);
  }
};

export const removeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError("Id is Required", 400));
    }
    const category = await Category.findByIdAndDelete(id);
    res.status(200).send(category);
  } catch (err) {
    next(err);
  }
};
