"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.addToCartValidation = [
    (0, express_validator_1.body)("productId")
        .notEmpty().withMessage("Product ID is required")
        .isString(), // Atau isUUID() jika ID kamu UUID
    (0, express_validator_1.body)("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ gt: 0 }).withMessage("Quantity must be a positive integer")
        .toInt(),
    validationHandler,
];
