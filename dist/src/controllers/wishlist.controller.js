"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wishlist_service_1 = require("../services/wishlist.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class WishlistController {
    wishlistService;
    constructor() {
        this.wishlistService = new wishlist_service_1.WishlistService();
    }
    getMyWishlist = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.wishlistService.getMyWishlist(req.user.id);
            res.status(200).send({
                success: true,
                message: "Wishlist retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getMyWishlist controller", error);
            next(error);
        }
    };
    addToWishlist = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { productId } = req.body;
            if (!productId) {
                throw new AppError_1.default("Product ID is required", 400);
            }
            const result = await this.wishlistService.addToWishlist(req.user.id, productId);
            res.status(201).send({
                success: true,
                message: "Added to wishlist successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in addToWishlist controller", error);
            next(error);
        }
    };
    removeFromWishlist = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id: productId } = req.params;
            await this.wishlistService.removeFromWishlist(req.user.id, productId);
            res.status(200).send({
                success: true,
                message: "Removed from wishlist successfully",
            });
        }
        catch (error) {
            logger_1.default.error("Error in removeFromWishlist controller", error);
            next(error);
        }
    };
}
exports.default = WishlistController;
