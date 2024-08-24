import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import Product from "../models/ProductsModel";
import CartItem from "../models/CartItems";
interface TReq extends Request {
  userId?: string;
}

export const addCartItem = async (
  req: TReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;
    const userId = req?.userId;
    const sessionId = req.sessionID;

    if (!productId) {
      return next(new AppError("Product ID is required", 400));
    }

    // Find existing cart item
    let cartItem = await CartItem.findOne({
      userId,
      productId,
    }).populate("productId");

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // Create new cart item if not exists
      cartItem = await CartItem.create({
        userId,
        sessionId,
        productId,
        quantity: 1,
      });

      cartItem.save();
    }
    // Get all cart items for the user
    const cartItems = await CartItem.find({
      userId,
    }).populate("productId");

    res.status(201).json(cartItems);
  } catch (err) {
    next(err);
  }
};

export const getCartItems = async (
  req: TReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const cartItems = await CartItem.find({
      $or: [{ userId }, { sessionId: req.sessionID }],
    }).populate("productId");

    res.status(200).json(cartItems);
  } catch (err) {
    next(err);
  }
};

interface TReq extends Request {
  userId?: string;
}

export const updateCartItem = async (
  req: TReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;
    const sessionId = req.sessionID;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!productId) {
      return next(new AppError("Product ID is required", 400));
    }

    // Find the cart item
    const cartItem = await CartItem.findOne({
      userId,
      productId,
    }).populate("productId");

    if (!cartItem) {
      return next(new AppError("Cart item not found", 404));
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      await cartItem.deleteOne();
    }

    // Fetch remaining cart items for the user/session
    const cartItems = await CartItem.find({
      userId,
    }).populate("productId");

    res.status(200).json(cartItems);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (
  req: TReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    if (!productId) {
      return next(new AppError("Product ID is required", 400));
    }

    // Find the cart item to delete
    const cartItem = await CartItem.findOneAndDelete({
      userId,
      productId,
    });

    if (!cartItem) {
      return next(new AppError("Cart item not found", 404));
    }

    const cartItems = await CartItem.find({
      userId,
    }).populate("productId");

    res.status(200).json(cartItems);
  } catch (err) {
    next(err);
  }
};
