"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_1 = require("../middleware/validation/order");
class OrderRouter {
    route;
    orderController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.orderController = new order_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.post("/", order_1.createOrderValidation, // Terapkan validasi
        this.orderController.createOrder);
        this.route.get("/", this.orderController.getMyOrders);
        this.route.get("/store-orders", this.authMiddleware.isSeller, this.orderController.getStoreOrders);
        this.route.patch("/:id/status", this.authMiddleware.isSeller, this.orderController.updateOrderStatus);
        // Buyer confirms order received
        this.route.patch("/:id/confirm-received", this.orderController.confirmOrderReceived);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = OrderRouter;
