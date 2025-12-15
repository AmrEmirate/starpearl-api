"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = __importDefault(require("../controllers/voucher.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class VoucherRouter {
    route;
    voucherController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.voucherController = new voucher_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.use(this.authMiddleware.isSeller);
        this.route.post("/", this.voucherController.createVoucher);
        this.route.get("/", this.voucherController.getMyVouchers);
        this.route.delete("/:id", this.voucherController.deleteVoucher);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = VoucherRouter;
