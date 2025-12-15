"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const cart_1 = require("../middleware/validation/cart");
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../utils/AppError"));
const updateValidationHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new AppError_1.default(errors.array()[0].msg, 400));
    }
    next();
};
class CartRouter {
    route;
    cartController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.cartController = new cart_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.get("/", this.cartController.getCart);
        this.route.post("/", cart_1.addToCartValidation, this.cartController.addItem);
        this.route.patch("/:itemId", (0, express_validator_1.body)("quantity")
            .notEmpty()
            .withMessage("Quantity is required")
            .isInt({ gt: 0 })
            .withMessage("Quantity must be a positive integer")
            .toInt(), updateValidationHandler, this.cartController.updateItem);
        this.route.delete("/:itemId", this.cartController.deleteItem);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = CartRouter;
