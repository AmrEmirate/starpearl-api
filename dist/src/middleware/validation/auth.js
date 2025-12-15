"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerSellerValidation = exports.registerBuyerValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.registerBuyerValidation = [
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Email is required and must be valid"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("password").isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }).withMessage("Password must be at least 6 characters long and include uppercase, lowercase, and numbers"),
    validationHandler,
];
exports.registerSellerValidation = [
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Email is required and must be valid"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("storeName").notEmpty().withMessage("Store name is required"),
    (0, express_validator_1.body)("password").isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }).withMessage("Password must be at least 6 characters long and include uppercase, lowercase, and numbers"),
    validationHandler,
];
exports.loginValidation = [
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    validationHandler,
];
