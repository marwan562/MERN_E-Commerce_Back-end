import { NextFunction, Request, Response } from "express";
import Order from "../models/OrderModel";
import Product from "../models/ProductsModel";
import ProductStat from "../models/ProductStat"; // Ensure this is the correct path
import AppError from "../utils/AppError";
import CartItem from "../models/CartItems";

export const createOrder = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const { cartItems, deliveryDetails } = req.body;

    if (!userId || !cartItems || !deliveryDetails) {
      return next(new AppError("All fields are required.", 400));
    }

    let computedTotalAmount = 0;
    const productPrices: { [key: string]: number } = {};

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(
          new AppError(`Product with ID ${item.productId} not found.`, 400)
        );
      }
      if (product.stock < item.quantity) {
        return next(
          new AppError(`Insufficient stock for product ${item.productId}`, 400)
        );
      }
      computedTotalAmount += item.quantity * product.price;
      productPrices[item.productId.toString()] = product.price;
    }

    await CartItem.deleteMany({ userId });

    const order = await Order.create({
      userId,
      cartItems,
      deliveryDetails,
      totalAmount: computedTotalAmount,
      status: "Pending",
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentDay = new Date().toISOString().split("T")[0];

    for (const item of cartItems) {
      const { productId, quantity } = item;
      const price = productPrices[productId.toString()];

      // Find existing ProductStat
      let productStat = await ProductStat.findOne({
        productId,
        year: currentYear,
      });

      if (!productStat) {
        // If no ProductStat exists, create a new one
        productStat = await ProductStat.create({
          productId,
          year: currentYear,
          yearlySalesTotal: 0,
          yearlyTotalSold: 0,
          monthlyData: [],
          dailyData: [],
        });
      }

      await ProductStat.findOneAndUpdate(
        { productId, year: currentYear },
        {
          $inc: {
            yearlySalesTotal: quantity * price,
            yearlyTotalSold: quantity,
            "monthlyData.$[monthElem].salesTotal": quantity * price,
            "monthlyData.$[monthElem].totalSold": quantity,
            "dailyData.$[dayElem].salesTotal": quantity * price,
            "dailyData.$[dayElem].totalSold": quantity,
          },
        },
        {
          arrayFilters: [
            { "monthElem.month": currentMonth },
            { "dayElem.date": currentDay },
          ],
          upsert: true,
          new: true,
        }
      );

      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }

    console.log("order created", order);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};
