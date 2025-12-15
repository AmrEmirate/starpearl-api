"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class CategoryService {
    async getAllCategories() {
        return prisma_1.prisma.category.findMany({
            include: {
                children: true,
            },
        });
    }
    async createCategory(data) {
        const existing = await prisma_1.prisma.category.findUnique({
            where: { slug: data.slug },
        });
        if (existing) {
            throw new AppError_1.default("Category slug already exists", 400);
        }
        return prisma_1.prisma.category.create({
            data,
        });
    }
    async updateCategory(id, data) {
        return prisma_1.prisma.category.update({
            where: { id },
            data,
        });
    }
    async deleteCategory(id) {
        return prisma_1.prisma.category.delete({
            where: { id },
        });
    }
}
exports.CategoryService = CategoryService;
