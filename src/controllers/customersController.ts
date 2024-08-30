import { NextFunction, Request, Response } from "express";
import User from "../models/UserModel";
import AppError from "../utils/AppError";
import mongoose from "mongoose";

export const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    createdAt = "latest",
    filterByRole,
  } = req.query;

  try {
    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);

    let query: any = {};

    if (search) {
      query["$or"] = [
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (filterByRole && filterByRole !== "all") {
      query["role"] = filterByRole;
    }
    const sortOrder = createdAt === "latest" ? -1 : 1;

    const customers = await User.find(query)
      .sort({ createdAt: sortOrder })
      .skip((pageNumber - 1) * size)
      .limit(size)
      .exec();

    const totalCustomers = await User.countDocuments();
    const totalPages = Math.ceil(totalCustomers / size);

    if (!customers.length) {
      return next(new AppError("Customers not found", 404));
    }

    res.status(200).json({
      customers,
      pagination: {
        totalPages,
        totalCustomers,
        page: pageNumber,
        pageSize: size,
      },
    });
  } catch (err) {
    next(new AppError("Failed to retrieve customers", 500));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid customer ID", 401));
    }

    const customer = await User.findByIdAndDelete(id);

    if (customer) {
      return next(new AppError("Customer not found.", 404));
    }

    res.status(200).send(customer);
  } catch (err) {
    next(err);
  }
};

export const updateRoleCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid customer ID", 401));
    }

    if (!role) {
      return next(new AppError("feild is required", 400));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.role = role || user.role;

    await user.save();
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};
