"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.createOrderValidation = [
    (0, express_validator_1.body)("addressId")
        .notEmpty().withMessage("Address ID is required")
        .isString(),
    (0, express_validator_1.body)("logisticsOption")
        .notEmpty().withMessage("Logistics option is required")
        .isString(),
    (0, express_validator_1.body)("paymentMethod")
        .notEmpty().withMessage("Payment method is required")
        .isString(),
    (0, express_validator_1.body)("shippingCost")
        .notEmpty().withMessage("Shipping cost is required")
        .isNumeric().withMessage("Shipping cost must be a number"),
    (0, express_validator_1.body)("serviceFee")
        .notEmpty().withMessage("Service fee is required")
        .isNumeric().withMessage("Service fee must be a number"),
    (0, express_validator_1.body)("subtotal") // <-- PERBAIKAN: Menambahkan validasi subtotal
        .notEmpty().withMessage("Subtotal is required")
        .isNumeric().withMessage("Subtotal must be a number"),
    (0, express_validator_1.body)("totalPrice")
        .notEmpty().withMessage("Total price is required")
        .isNumeric().withMessage("Total price must be a number"),
    validationHandler,
];
