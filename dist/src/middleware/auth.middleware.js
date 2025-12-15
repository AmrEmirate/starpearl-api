"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const AppError_1 = __importDefault(require("../utils/AppError"));
const prisma_1 = require("../config/prisma");
class AuthMiddleware {
    async verifyToken(req, res, next) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return next(new AppError_1.default("Unauthorized", 401));
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return next(new AppError_1.default("Server configuration error", 500));
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, secret);
            const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) {
                return next(new AppError_1.default("User not found", 404));
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            return next(new AppError_1.default("Invalid token", 401));
        }
    }
    async extractUser(req, res, next) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return next();
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return next();
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, secret);
            req.user = decoded;
            next();
        }
        catch (err) {
            next();
        }
    }
    isAdmin = (req, res, next) => {
        const user = req.user;
        if (user?.role !== "ADMIN") {
            return next(new AppError_1.default("Forbidden: Admins only", 403));
        }
        next();
    };
    isSeller = (req, res, next) => {
        const user = req.user;
        if (user?.role !== "SELLER") {
            return next(new AppError_1.default("Forbidden: Sellers only", 403));
        }
        next();
    };
}
exports.AuthMiddleware = AuthMiddleware;
