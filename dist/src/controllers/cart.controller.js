"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_service_1 = require("../services/cart.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class CartController {
    cartService;
    constructor() {
        this.cartService = new cart_service_1.CartService();
    }
    addItem = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { productId, quantity } = req.body;
            const userId = req.user.id;
            const result = await this.cartService.addItemToCart(userId, productId, quantity);
            res.status(201).send({
                success: true,
                message: "Item added to cart",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in addItem controller", error);
            next(error);
        }
    };
    getCart = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const userId = req.user.id;
            const result = await this.cartService.getCart(userId);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getCart controller", error);
            next(error);
        }
    };
    updateItem = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { itemId } = req.params;
            const { quantity } = req.body;
            const userId = req.user.id;
            if (!quantity) {
                throw new AppError_1.default("Quantity is required", 400);
            }
            const result = await this.cartService.updateItemQuantity(userId, itemId, Number(quantity));
            res.status(200).send({
                success: true,
                message: "Cart item updated",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateItem controller", error);
            next(error);
        }
    };
    deleteItem = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { itemId } = req.params;
            const userId = req.user.id;
            const result = await this.cartService.deleteItem(userId, itemId);
            res.status(200).send({
                success: true,
                message: "Cart item deleted",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in deleteItem controller", error);
            next(error);
        }
    };
}
exports.default = CartController;
