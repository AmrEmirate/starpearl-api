"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawal_controller_1 = __importDefault(require("../controllers/withdrawal.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class WithdrawalRouter {
    route;
    withdrawalController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.withdrawalController = new withdrawal_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.use(this.authMiddleware.isSeller);
        this.route.post("/", this.withdrawalController.requestWithdrawal);
        this.route.get("/", this.withdrawalController.getMyWithdrawals);
        this.route.get("/balance", this.withdrawalController.getBalance);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = WithdrawalRouter;
