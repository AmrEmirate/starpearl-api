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

export const updateUserValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString(),
  validationHandler,
];
