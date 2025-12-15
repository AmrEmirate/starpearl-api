"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class AdminRouter {
    route;
    adminController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.adminController = new admin_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.use(this.authMiddleware.isAdmin);
        this.route.get("/stats", this.adminController.getStats);
        this.route.get("/stores/pending", this.adminController.getPendingStores);
        this.route.patch("/stores/:id/verify", this.adminController.verifyStore);
        this.route.get("/withdrawals/pending", this.adminController.getPendingWithdrawals);
        this.route.patch("/withdrawals/:id/process", this.adminController.processWithdrawal);
        // Settings
        this.route.get("/settings", this.adminController.getSettings);
        this.route.put("/settings", this.adminController.updateSettings);
        // Content (Banners)
        this.route.get("/content", this.adminController.getBanners);
        this.route.post("/content", this.adminController.createBanner);
        this.route.put("/content/:id", this.adminController.updateBanner);
        this.route.delete("/content/:id", this.adminController.deleteBanner);
        // Promotions
        this.route.get("/promotions", this.adminController.getPromotions);
        this.route.post("/promotions", this.adminController.createPromotion);
        this.route.put("/promotions/:id", this.adminController.updatePromotion);
        this.route.delete("/promotions/:id", this.adminController.deletePromotion);
        // Community Moderation
        this.route.get("/community/posts/pending", this.adminController.getPendingPosts);
        this.route.patch("/community/posts/:id/status", this.adminController.moderatePost);
        // Disputes
        this.route.get("/disputes", this.adminController.getDisputes);
        this.route.post("/disputes/:id/resolve", this.adminController.resolveDispute);
        // User Management
        this.route.get("/users", this.adminController.getAllUsers);
        this.route.patch("/users/:id/suspend", this.adminController.suspendUser);
        this.route.delete("/users/:id", this.adminController.deleteUser);
        this.route.post("/users/:id/reset-password", this.adminController.resetUserPassword);
        // Enhanced Reporting
        this.route.get("/reports/sales", this.adminController.getSalesReport);
        this.route.get("/reports/service-fee", this.adminController.getServiceFeeReport);
        this.route.get("/reports/traffic", this.adminController.getTrafficReport);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = AdminRouter;
