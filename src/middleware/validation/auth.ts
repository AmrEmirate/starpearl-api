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

export const registerBuyerValidation = [
  body("email").notEmpty().isEmail().withMessage("Email is required and must be valid"),
  body("name").notEmpty().withMessage("Name is required"),
  body("password").isStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }).withMessage("Password must be at least 6 characters long and include uppercase, lowercase, and numbers"),
  validationHandler,
];

export const registerSellerValidation = [
  body("email").notEmpty().isEmail().withMessage("Email is required and must be valid"),
  body("name").notEmpty().withMessage("Name is required"),
  body("storeName").notEmpty().withMessage("Store name is required"),
  body("password").isStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }).withMessage("Password must be at least 6 characters long and include uppercase, lowercase, and numbers"),
  validationHandler,
];

export const loginValidation = [
  body("email").notEmpty().isEmail().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validationHandler,
];
