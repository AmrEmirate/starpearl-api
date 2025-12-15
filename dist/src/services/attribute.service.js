"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class AttributeService {
    async getAllAttributes() {
        return prisma_1.prisma.attribute.findMany({
            include: {
                values: true,
            },
        });
    }
    async createAttribute(name) {
        const existing = await prisma_1.prisma.attribute.findUnique({
            where: { name },
        });
        if (existing) {
            throw new AppError_1.default("Attribute already exists", 400);
        }
        return prisma_1.prisma.attribute.create({
            data: { name },
            include: { values: true },
        });
    }
    async addAttributeValue(attributeId, value) {
        const attribute = await prisma_1.prisma.attribute.findUnique({
            where: { id: attributeId },
        });
        if (!attribute) {
            throw new AppError_1.default("Attribute not found", 404);
        }
        // Check if value exists for this attribute
        const existingValue = await prisma_1.prisma.attributeValue.findFirst({
            where: {
                attributeId,
                value,
            },
        });
        if (existingValue) {
            throw new AppError_1.default("Value already exists for this attribute", 400);
        }
        return prisma_1.prisma.attributeValue.create({
            data: {
                attributeId,
                value,
            },
        });
    }
    async deleteAttribute(id) {
        return prisma_1.prisma.attribute.delete({
            where: { id },
        });
    }
    async deleteAttributeValue(id) {
        return prisma_1.prisma.attributeValue.delete({
            where: { id },
        });
    }
}
exports.AttributeService = AttributeService;
