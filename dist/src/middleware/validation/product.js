"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.createProductValidation = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Product name is required")
        .isString(),
    (0, express_validator_1.body)("description")
        .notEmpty()
        .withMessage("Product description is required")
        .isString(),
    (0, express_validator_1.body)("price")
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage("Price must be a number")
        .toFloat() // Konversi ke float
        .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    (0, express_validator_1.body)("stock")
        .notEmpty().withMessage("Stock is required")
        .isInt({ gt: -1 }).withMessage("Stock must be a non-negative integer") // Izinkan 0
        .toInt(), // Konversi ke integer
    (0, express_validator_1.body)("categoryId")
        .notEmpty()
        .withMessage("Category ID is required")
        .isString(), // Atau isUUID() jika ID kategori adalah UUID
    (0, express_validator_1.body)("imageUrls")
        .optional()
        .isArray().withMessage("imageUrls must be an array")
        .custom((value) => {
        if (!Array.isArray(value))
            return false;
        return value.every((item) => typeof item === 'string' && item.startsWith('http'));
    }).withMessage('All imageUrls must be valid URLs'),
    validationHandler,
];
