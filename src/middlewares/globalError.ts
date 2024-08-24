import { NextFunction, Request, Response } from "express";

type TError = {
  message: any;
  isOperational: boolean;
  statusCode: number;
  status: string;
  errors: string[];
  stack: string;
};

const globalError = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.stack) {
    return res.status(401).send("Unauthenticated!");
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("ERROR 💥", err);

  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

export default globalError;
