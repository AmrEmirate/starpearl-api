import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import AppError from "../../utils/AppError";

const validationHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

export const addToCartValidation = [
  body("productId")
    .notEmpty().withMessage("Product ID is required")
    .isString(), // Atau isUUID() jika ID kamu UUID
  body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ gt: 0 }).withMessage("Quantity must be a positive integer")
    .toInt(),
  validationHandler,
];
