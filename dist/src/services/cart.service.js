"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_repository_1 = require("../repositories/cart.repository");
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
class CartService {
    cartRepository;
    constructor() {
        this.cartRepository = new cart_repository_1.CartRepository();
    }
    /**
     * Logika untuk mendapatkan keranjang, atau membuatnya jika tidak ada.
     */
    async getOrCreateCart(userId) {
        let cart = await this.cartRepository.findCartByUserId(userId);
        if (!cart) {
            logger_1.default.info(`No active cart found for user ${userId}, creating new one.`);
            cart = await this.cartRepository.createCart(userId);
        }
        return cart;
    }
    /**
     * Logika untuk menambahkan produk ke keranjang.
     */
    async addItemToCart(userId, productId, quantity) {
        logger_1.default.info(`Attempting to add ${quantity} of product ${productId} for user ${userId}`);
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId, isActive: true, store: { status: "APPROVED" } },
        });
        if (!product) {
            throw new AppError_1.default("Product not found, inactive, or store not approved", 404);
        }
        if (product.stock < quantity) {
            throw new AppError_1.default(`Not enough stock. Available: ${product.stock}`, 400);
        }
        const cart = await this.getOrCreateCart(userId);
        const existingItem = await this.cartRepository.findCartItem(cart.id, productId);
        let updatedItem;
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                throw new AppError_1.default(`Not enough stock. You have ${existingItem.quantity} in cart. Available: ${product.stock}`, 400);
            }
            logger_1.default.info(`Product ${productId} already in cart, updating quantity to ${newQuantity}`);
            updatedItem = await this.cartRepository.updateCartItemQuantity(existingItem.id, newQuantity);
        }
        else {
            logger_1.default.info(`Product ${productId} not in cart, creating new cart item.`);
            updatedItem = await this.cartRepository.addCartItem(cart.id, productId, quantity);
        }
        return updatedItem;
    }
    /**
     * Logika untuk mengambil isi keranjang.
     */
    async getCart(userId) {
        logger_1.default.info(`Fetching cart for user: ${userId}`);
        const cart = await this.cartRepository.findCartByUserId(userId);
        if (!cart) {
            return {
                id: null,
                userId: userId,
                items: [],
                total: 0,
            };
        }
        const fullCart = (await this.cartRepository.getFullCart(cart.id)); // Cast ke tipe baru
        const total = fullCart?.items.reduce((sum, item) => {
            if (item.product) {
                return sum + Number(item.product.price) * item.quantity; // Konversi Decimal ke number
            }
            return sum;
        }, 0) || 0;
        return { ...fullCart, total };
    }
    /**
     * Logika untuk memperbarui kuantitas item di keranjang.
     */
    async updateItemQuantity(userId, itemId, newQuantity) {
        logger_1.default.info(`Attempting to update item ${itemId} to quantity ${newQuantity} for user ${userId}`);
        if (newQuantity <= 0) {
            logger_1.default.info(`Quantity is ${newQuantity}, deleting item ${itemId}`);
            return this.deleteItem(userId, itemId); // Jika 0 atau kurang, hapus item
        }
        const item = await this.cartRepository.findCartItemByIdAndUserId(itemId, userId);
        if (!item) {
            throw new AppError_1.default("Cart item not found or does not belong to user", 404);
        }
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: item.productId },
        });
        if (!product) {
            throw new AppError_1.default("Product associated with item not found", 404);
        }
        if (product.stock < newQuantity) {
            throw new AppError_1.default(`Not enough stock. Available: ${product.stock}`, 400);
        }
        const updatedItem = await this.cartRepository.updateCartItemQuantity(itemId, newQuantity);
        return updatedItem;
    }
    /**
     * Logika untuk menghapus item dari keranjang.
     */
    async deleteItem(userId, itemId) {
        logger_1.default.info(`Attempting to delete item ${itemId} for user ${userId}`);
        const item = await this.cartRepository.findCartItemByIdAndUserId(itemId, userId);
        if (!item) {
            throw new AppError_1.default("Cart item not found or does not belong to user", 404);
        }
        const deletedItem = await this.cartRepository.deleteCartItem(itemId);
        return deletedItem;
    }
}
exports.CartService = CartService;
