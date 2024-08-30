import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/ProductsModel";
import Category from "../models/CategoryModel";
import AppError from "../utils/AppError";
import { uploadImageUrl } from "../utils/uploadImageUrl";
import ProductStat from "../models/ProductStat";

// Get all products with pagination, filtering, and search
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

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const image = req.file;
    const { title, price, categoryId, stock } = req.body;

    if (!image) {
      return next(new AppError("Image file is required.", 400));
    }

    const uploadResponse = await uploadImageUrl(image);

    const newProduct = new Product({
      title,
      price,
      category: categoryId,
      img: uploadResponse,
      stock,
      role: "New",
    });

    await newProduct.save();

    const newProductStat = new ProductStat({
      productId: newProduct._id,
      year: new Date().getFullYear(), 
      monthlyData: [],
      dailyData: [],
      yearlySalesTotal: 0,
      yearlyTotalSold: 0,
    });

    await newProductStat.save();

    if (categoryId) {
      await Category.updateMany(
        { _id: { $in: categoryId } },
        { $push: { products: newProduct._id } }
      );
    }

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Product ID is required.", 400));
  }
  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return next(new AppError("Product not found.", 404));
    }

    await Category.updateMany({ products: id }, { $pull: { products: id } });

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// Update an existing product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const image = req.file;

  if (!id) {
    return next(new AppError("Product ID is required.", 400));
  }
  try {
    const { title, price, categoryId, stock, role } = req.body;

    const product = await Product.findById(id).populate("category");

    if (!product) {
      return next(new AppError("Product not found.", 404));
    }

    product.title = title || product.title;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.role = role || product.role;

    if (image) {
      const uploadResponse = await uploadImageUrl(image);
      product.img = uploadResponse;
    }

    if (categoryId) {
      await Category.updateMany({ products: id }, { $pull: { products: id } });

      await Category.updateMany(
        { _id: { $in: categoryId } },
        { $push: { products: id } }
      );
      product.category = categoryId;
    }

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};
