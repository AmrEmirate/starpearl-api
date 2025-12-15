"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const wishlist_repository_1 = require("../repositories/wishlist.repository");
const product_repository_1 = require("../repositories/product.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
class WishlistService {
    wishlistRepository;
    productRepository;
    constructor() {
        this.wishlistRepository = new wishlist_repository_1.WishlistRepository();
        this.productRepository = new product_repository_1.ProductRepository();
    }
    async getOrCreateWishlist(userId) {
        let wishlist = await this.wishlistRepository.getWishlistByUserId(userId);
        if (!wishlist) {
            wishlist = await this.wishlistRepository.createWishlist(userId);
        }
        return wishlist;
    }
    async getMyWishlist(userId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        return this.wishlistRepository.getWishlistByUserId(userId);
    }
    async addToWishlist(userId, productId) {
        const product = await this.productRepository.findProductById(productId);
        if (!product) {
            throw new AppError_1.default("Product not found", 404);
        }
        const wishlist = await this.getOrCreateWishlist(userId);
        const existingItem = await this.wishlistRepository.findItem(wishlist.id, productId);
        if (existingItem) {
            throw new AppError_1.default("Product already in wishlist", 400);
        }
        return this.wishlistRepository.addItem(wishlist.id, productId);
    }
    async removeFromWishlist(userId, productId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        await this.wishlistRepository.removeItem(wishlist.id, productId);
    }
}
exports.WishlistService = WishlistService;
