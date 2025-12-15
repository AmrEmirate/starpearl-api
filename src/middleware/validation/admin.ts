import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import AppError from "../../utils/AppError";
import { StoreStatus } from "@prisma/client"; // Impor enum StoreStatus

const validationHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

export const updateStoreStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(StoreStatus)) // Pastikan statusnya valid
    .withMessage(
      `Invalid status. Must be one of: ${Object.values(StoreStatus).join(", ")}`
    ),
  validationHandler,
];
