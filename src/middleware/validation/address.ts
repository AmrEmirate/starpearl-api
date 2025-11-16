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

export const addressValidation = [
  body("label")
    .notEmpty().withMessage("Address label is required (e.g., Home, Office)")
    .isString(),
  body("recipientName")
    .notEmpty().withMessage("Recipient name is required")
    .isString(),
  body("phone")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("id-ID").withMessage("Must be a valid Indonesian phone number"),
  body("street")
    .notEmpty().withMessage("Street address is required")
    .isString(),
  body("city")
    .notEmpty().withMessage("City is required")
    .isString(),
  body("province")
    .notEmpty().withMessage("Province is required")
    .isString(),
  body("postalCode")
    .notEmpty().withMessage("Postal code is required")
    .isPostalCode("ID").withMessage("Must be a valid Indonesian postal code"),
  body("isDefault")
    .optional()
    .isBoolean().withMessage("isDefault must be true or false"),
  validationHandler,
];  