"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreStatusValidation = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const client_1 = require("@prisma/client"); // Impor enum StoreStatus
const validationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
exports.updateStoreStatusValidation = [
    (0, express_validator_1.body)("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(Object.values(client_1.StoreStatus)) // Pastikan statusnya valid
        .withMessage(`Invalid status. Must be one of: ${Object.values(client_1.StoreStatus).join(", ")}`),
    validationHandler,
];
