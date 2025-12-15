"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = __importDefault(require("../controllers/store.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class StoreRouter {
    route;
    storeController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.storeController = new store_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.get("/my-store", this.authMiddleware.isSeller, this.storeController.getMyStore);
        this.route.patch("/my-store", this.authMiddleware.isSeller, this.storeController.updateMyStore);
        this.route.get("/dashboard/stats", this.authMiddleware.isSeller, this.storeController.getDashboardStats);
        this.route.post("/verification", this.authMiddleware.isSeller, this.storeController.submitVerification);
        // Public Store Profile
        this.route.get("/:id", this.storeController.getStoreById);
        // Follow/Unfollow
        this.route.post("/:id/follow", this.authMiddleware.verifyToken, this.storeController.followStore);
        this.route.delete("/:id/follow", this.authMiddleware.verifyToken, this.storeController.unfollowStore);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = StoreRouter;
