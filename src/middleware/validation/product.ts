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

export const createProductValidation = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isString(),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isString(),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isNumeric().withMessage("Price must be a number")
    .toFloat() // Konversi ke float
    .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("stock")
    .notEmpty().withMessage("Stock is required")
    .isInt({ gt: -1 }).withMessage("Stock must be a non-negative integer") // Izinkan 0
    .toInt(), // Konversi ke integer
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isString(), // Atau isUUID() jika ID kategori adalah UUID
  body("imageUrls")
    .optional()
    .isArray().withMessage("imageUrls must be an array")
    .custom((value) => {
        if (!Array.isArray(value)) return false;
        return value.every((item) => typeof item === 'string' && item.startsWith('http'));
    }).withMessage('All imageUrls must be valid URLs'),
  // Anda bisa tambahkan validasi lain di sini jika perlu
  validationHandler,
];