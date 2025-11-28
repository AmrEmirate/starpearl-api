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

export const createOrderValidation = [
  body("addressId")
    .notEmpty().withMessage("Address ID is required")
    .isString(),
  body("logisticsOption")
    .notEmpty().withMessage("Logistics option is required")
    .isString(),
  body("paymentMethod")
    .notEmpty().withMessage("Payment method is required")
    .isString(),
  body("shippingCost")
    .notEmpty().withMessage("Shipping cost is required")
    .isNumeric().withMessage("Shipping cost must be a number"),
  body("serviceFee")
    .notEmpty().withMessage("Service fee is required")
    .isNumeric().withMessage("Service fee must be a number"),
  body("subtotal") // <-- PERBAIKAN: Menambahkan validasi subtotal
    .notEmpty().withMessage("Subtotal is required")
    .isNumeric().withMessage("Subtotal must be a number"),
  body("totalPrice")
    .notEmpty().withMessage("Total price is required")
    .isNumeric().withMessage("Total price must be a number"),
    
  validationHandler,
];
