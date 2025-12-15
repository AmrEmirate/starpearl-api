"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.addressValidation = [
    (0, express_validator_1.body)("label")
        .notEmpty().withMessage("Address label is required (e.g., Home, Office)")
        .isString(),
    (0, express_validator_1.body)("recipientName")
        .notEmpty().withMessage("Recipient name is required")
        .isString(),
    (0, express_validator_1.body)("phone")
        .notEmpty().withMessage("Phone number is required")
        .isMobilePhone("id-ID").withMessage("Must be a valid Indonesian phone number"),
    (0, express_validator_1.body)("street")
        .notEmpty().withMessage("Street address is required")
        .isString(),
    (0, express_validator_1.body)("city")
        .notEmpty().withMessage("City is required")
        .isString(),
    (0, express_validator_1.body)("province")
        .notEmpty().withMessage("Province is required")
        .isString(),
    (0, express_validator_1.body)("postalCode")
        .notEmpty().withMessage("Postal code is required")
        .isPostalCode("ID").withMessage("Must be a valid Indonesian postal code"),
    (0, express_validator_1.body)("isDefault")
        .optional()
        .isBoolean().withMessage("isDefault must be true or false"),
    validationHandler,
];
