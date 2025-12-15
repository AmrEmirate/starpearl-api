"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_service_1 = require("../services/order.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class OrderController {
    orderService;
    constructor() {
        this.orderService = new order_service_1.OrderService();
    }
    createOrder = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.orderService.createOrder(req.user.id, req.body);
            res.status(201).send({
                success: true,
                message: "Order created successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in createOrder controller", error);
            next(error);
        }
    };
    getMyOrders = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.orderService.getMyOrders(req.user.id);
            res.status(200).send({
                success: true,
                message: "Orders retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getMyOrders controller", error);
            next(error);
        }
    };
    getStoreOrders = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.orderService.getStoreOrders(req.user.id);
            res.status(200).send({
                success: true,
                message: "Store orders retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getStoreOrders controller", error);
            next(error);
        }
    };
    updateOrderStatus = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id } = req.params;
            const { status, shippingResi } = req.body;
            if (!status) {
                throw new AppError_1.default("Status is required", 400);
            }
            const result = await this.orderService.updateOrderStatus(req.user.id, id, status, shippingResi);
            res.status(200).send({
                success: true,
                message: "Order status updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateOrderStatus controller", error);
            next(error);
        }
    };
    confirmOrderReceived = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id } = req.params;
            const result = await this.orderService.confirmOrderReceived(req.user.id, id);
            res.status(200).send({
                success: true,
                message: "Order confirmed as received",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in confirmOrderReceived controller", error);
            next(error);
        }
    };
}
exports.default = OrderController;
