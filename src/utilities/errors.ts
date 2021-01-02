import { Request, Response, NextFunction } from "express";

const errorCatcher = (
  func: (req: Request, res: Response, next: NextFunction) => any
) => (req: Request, res: Response, next: NextFunction) =>
  func(req, res, next).catch(next);

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const error = { message: err.message || "Internal Server Error", stack: "" };
  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack || "";
    console.log(error.stack);
  }

  res.status(status).json({ status, error });
};

export { errorCatcher, errorHandler };
