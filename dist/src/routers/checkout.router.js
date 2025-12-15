"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = __importDefault(require("../controllers/checkout.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class CheckoutRouter {
    route;
    checkoutController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.checkoutController = new checkout_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.post("/", this.checkoutController.checkout);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = CheckoutRouter;
