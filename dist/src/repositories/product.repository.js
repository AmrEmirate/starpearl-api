"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class ProductRepository {
    async createProduct(data) {
        try {
            return await prisma_1.prisma.product.create({
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating product for store: ${data.storeId}`, error);
            throw new Error("Database query failed while creating product");
        }
    }
    async findProducts(filters) {
        try {
            const where = {
                isActive: true,
                store: {
                    status: "APPROVED",
                },
                ...filters, // Gabungkan dengan filter tambahan
            };
            return await prisma_1.prisma.product.findMany({
                where,
                include: {
                    store: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error finding products", error);
            throw new Error("Database query failed while finding products");
        }
    }
    async findProductById(productId) {
        try {
            return await prisma_1.prisma.product.findFirst({
                where: {
                    id: productId,
                    isActive: true,
                    store: {
                        status: "APPROVED",
                    },
                },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding product by id: ${productId}`, error);
            throw new Error("Database query failed while finding product by id");
        }
    }
    async findProductsByStoreId(storeId) {
        try {
            return await prisma_1.prisma.product.findMany({
                where: {
                    storeId: storeId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding products for store: ${storeId}`, error);
            throw new Error("Database query failed while finding store products");
        }
    }
    async updateProduct(id, data) {
        try {
            return await prisma_1.prisma.product.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating product: ${id}`, error);
            throw new Error("Database query failed while updating product");
        }
    }
    async deleteProduct(id) {
        try {
            return await prisma_1.prisma.product.update({
                where: { id },
                data: { isActive: false },
            });
        }
        catch (error) {
            logger_1.default.error(`Error deleting product: ${id}`, error);
            throw new Error("Database query failed while deleting product");
        }
    }
}
exports.ProductRepository = ProductRepository;
