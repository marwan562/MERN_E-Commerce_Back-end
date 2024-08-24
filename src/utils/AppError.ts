class AppError extends Error {
  constructor(
    message: string,
    statusCode: number,
    errors?: { [key: string]: string }
  ) {
    super(message);
    this.errors = errors ?? {};
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
  isOperational: boolean;
  statusCode: number;
  status: string;
  errors: { [key: string]: string };
}

export default AppError;
