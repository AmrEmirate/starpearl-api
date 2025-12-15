"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class CategoryRouter {
    route;
    controller;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.controller = new category_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/", this.controller.getAllCategories);
        // Admin only routes
        this.route.post("/", this.authMiddleware.verifyToken, this.authMiddleware.isAdmin, this.controller.createCategory);
        this.route.patch("/:id", this.authMiddleware.verifyToken, this.authMiddleware.isAdmin, this.controller.updateCategory);
        this.route.delete("/:id", this.authMiddleware.verifyToken, this.authMiddleware.isAdmin, this.controller.deleteCategory);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = CategoryRouter;
