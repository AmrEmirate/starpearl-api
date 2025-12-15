"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../config/prisma");
const product_repository_1 = require("../repositories/product.repository");
const store_repository_1 = require("../repositories/store.repository");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const library_1 = require("@prisma/client/runtime/library");
class ProductService {
    productRepository;
    storeRepository;
    constructor() {
        this.productRepository = new product_repository_1.ProductRepository();
        this.storeRepository = new store_repository_1.StoreRepository();
    }
    async createProduct(userId, data) {
        logger_1.default.info(`Creating product for user: ${userId}`);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store) {
            throw new AppError_1.default("User does not have a store", 400);
        }
        if (store.status !== "APPROVED") {
            throw new AppError_1.default("Store is not approved yet", 403);
        }
        let categoryRecordId;
        // Support both categoryId (direct ID) and category (name)
        if (data.categoryId) {
            const categoryExists = await prisma_1.prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!categoryExists) {
                throw new AppError_1.default("Category not found", 404);
            }
            categoryRecordId = data.categoryId;
        }
        else if (data.category) {
            let categoryRecord = await prisma_1.prisma.category.findUnique({
                where: { name: data.category },
            });
            if (!categoryRecord) {
                const slug = data.category.toLowerCase().replace(/ /g, "-");
                categoryRecord = await prisma_1.prisma.category.create({
                    data: {
                        name: data.category,
                        slug: slug,
                    },
                });
            }
            categoryRecordId = categoryRecord.id;
        }
        else {
            throw new AppError_1.default("Category is required", 400);
        }
        // Create product with transaction to handle attributes
        const product = await prisma_1.prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    stock: data.stock,
                    imageUrls: data.imageUrls,
                    storeId: store.id,
                    isActive: true,
                    price: new library_1.Decimal(data.price),
                    categoryId: categoryRecordId,
                },
            });
            // Add attribute assignments if provided
            if (data.attributeValueIds && data.attributeValueIds.length > 0) {
                await tx.productAttributeAssignment.createMany({
                    data: data.attributeValueIds.map((attrValId) => ({
                        productId: newProduct.id,
                        attributeValueId: attrValId,
                    })),
                });
            }
            return newProduct;
        });
        return product;
    }
    async getAllProducts(queryParams) {
        const filters = {};
        if (queryParams) {
            if (queryParams.q) {
                filters.name = {
                    contains: queryParams.q,
                    mode: "insensitive", // Case insensitive
                };
            }
            if (queryParams.category) {
                filters.category = {
                    name: {
                        equals: queryParams.category,
                        mode: "insensitive",
                    },
                };
            }
            if (queryParams.minPrice !== undefined ||
                queryParams.maxPrice !== undefined) {
                filters.price = {};
                if (queryParams.minPrice !== undefined) {
                    filters.price.gte = new library_1.Decimal(queryParams.minPrice);
                }
                if (queryParams.maxPrice !== undefined) {
                    filters.price.lte = new library_1.Decimal(queryParams.maxPrice);
                }
            }
        }
        return this.productRepository.findProducts(filters);
    }
    async getStoreProducts(userId) {
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        return this.productRepository.findProductsByStoreId(store.id);
    }
    async getProductById(id) {
        const product = await this.productRepository.findProductById(id);
        if (!product) {
            throw new AppError_1.default("Product not found", 404);
        }
        return product;
    }
    async updateProduct(userId, productId, data) {
        const product = await this.productRepository.findProductById(productId);
        if (!product)
            throw new AppError_1.default("Product not found", 404);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store || store.id !== product.storeId) {
            throw new AppError_1.default("You do not own this product", 403);
        }
        const updateData = { ...data };
        if (data.price) {
            updateData.price = new library_1.Decimal(data.price);
        }
        return this.productRepository.updateProduct(productId, updateData);
    }
    async deleteProduct(userId, productId) {
        const product = await this.productRepository.findProductById(productId);
        if (!product)
            throw new AppError_1.default("Product not found", 404);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store || store.id !== product.storeId) {
            throw new AppError_1.default("You do not own this product", 403);
        }
        return this.productRepository.deleteProduct(productId);
    }
}
exports.ProductService = ProductService;
