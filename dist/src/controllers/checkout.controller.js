"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_service_1 = require("../services/order.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class CheckoutController {
    orderService;
    constructor() {
        this.orderService = new order_service_1.OrderService();
    }
    checkout = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { addressId, logisticsOption = "Standard", paymentMethod = "Midtrans", shippingCost = 25000, serviceFee = 0, totalPrice, voucherCode, } = req.body;
            if (!addressId) {
                throw new AppError_1.default("Address ID is required", 400);
            }
            if (!totalPrice) {
                throw new AppError_1.default("Total price is required", 400);
            }
            const order = await this.orderService.createOrder(req.user.id, {
                addressId,
                logisticsOption,
                paymentMethod,
                shippingCost,
                serviceFee,
                totalPrice,
            });
            res.status(201).send({
                success: true,
                message: "Order placed successfully",
                data: order,
            });
        }
        catch (error) {
            logger_1.default.error("Error in checkout controller", error);
            next(error);
        }
    };
}
exports.default = CheckoutController;
