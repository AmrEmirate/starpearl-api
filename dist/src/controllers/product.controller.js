"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_service_1 = require("../services/product.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class ProductController {
    productService;
    constructor() {
        this.productService = new product_service_1.ProductService();
    }
    createProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.productService.createProduct(req.user.id, req.body);
            res.status(201).send({
                success: true,
                message: "Product created successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in createProduct controller", error);
            next(error);
        }
    };
    getMyProducts = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.productService.getStoreProducts(req.user.id);
            res.status(200).send({
                success: true,
                message: "Store products retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getMyProducts controller", error);
            next(error);
        }
    };
    getAllProducts = async (req, res, next) => {
        try {
            const { q, category, minPrice, maxPrice } = req.query;
            const queryParams = {
                q: q,
                category: category,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
            };
            const result = await this.productService.getAllProducts(queryParams);
            res.status(200).send({
                success: true,
                message: "Products retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getAllProducts controller", error);
            next(error);
        }
    };
    getProductById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.productService.getProductById(id);
            res.status(200).send({
                success: true,
                message: "Product retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getProductById controller", error);
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id } = req.params;
            const result = await this.productService.updateProduct(req.user.id, id, req.body);
            res.status(200).send({
                success: true,
                message: "Product updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateProduct controller", error);
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id } = req.params;
            const result = await this.productService.deleteProduct(req.user.id, id);
            res.status(200).send({
                success: true,
                message: "Product deleted successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in deleteProduct controller", error);
            next(error);
        }
    };
}
exports.default = ProductController;
