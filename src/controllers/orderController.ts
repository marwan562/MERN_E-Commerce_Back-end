import { NextFunction, Request, Response } from "express";
import Order from "../models/OrderModel";
import Product from "../models/ProductsModel";
import ProductStat from "../models/ProductStat"; // Ensure this is the correct path
import AppError from "../utils/AppError";
import CartItem from "../models/CartItems";
import { endOfDay, startOfDay, subMonths, subWeeks } from "date-fns";

export const findOrder = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const { orderId } = req.query;
    if (!userId || !orderId) {
      return next(new AppError("All fields are required.", 400));
    }

    // Adjust your query to match ObjectId types
    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return next(new AppError("Order Not Found.", 404));
    }

    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const { page = 1, pageSize = 10, status, duration } = req.query;

  try {
    if (!userId) {
      return next(new AppError("User Id not found", 404));
    }

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    const query: any = { userId };

    if (status) {
      query.status = status;
    }

    if (duration) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = endOfDay(now);

      switch (duration) {
        case "this week":
          startDate = startOfDay(subWeeks(now, 1));
          break;
        case "this month":
          startDate = startOfDay(subMonths(now, 1));
          break;
        case "last 3 months":
          startDate = startOfDay(subMonths(now, 3));
          break;
        case "last 6 months":
          startDate = startOfDay(subMonths(now, 6));
          break;
        case "this year":
          startDate = startOfDay(new Date(now.getFullYear(), 0, 1));
          break;
        default:
          startDate = startOfDay(new Date(0)); 
      }

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query)
      .skip((pageNumber - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 })
      .lean(); 

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / size);

    res.status(200).json({
      orders,
      pagination: {
        totalOrders,
        totalPages,
        page: pageNumber,
        pageSize: size,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const updateOrderStatus = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.params;
  const { status } = req.body; 

  try {
  
    if (!orderId) {
      return next(new AppError("Order ID is required", 400));
    }

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      order,
    });
  } catch (err) {
    next(err);
  }
};

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
        product.stock = 0;
        product.role = "Sale";
        await product.save();
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
