"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const order_repository_1 = require("../repositories/order.repository");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
class PaymentController {
    paymentService;
    orderRepository;
    constructor() {
        this.paymentService = new payment_service_1.PaymentService();
        this.orderRepository = new order_repository_1.OrderRepository();
    }
    handleWebhook = async (req, res, next) => {
        try {
            const { order_id, transaction_status, gross_amount, signature_key, fraud_status, } = req.body;
            logger_1.default.info(`Received webhook for order ${order_id}: ${transaction_status}`);
            const isValid = this.paymentService.verifySignature(order_id, req.body.status_code, gross_amount, signature_key);
            if (!isValid) {
                logger_1.default.warn(`Invalid signature for order ${order_id}`);
                res.status(400).json({ message: "Invalid signature" });
                return;
            }
            let newStatus = client_1.OrderStatus.PENDING_PAYMENT;
            let paymentStatus = "PENDING";
            if (transaction_status === "capture") {
                if (fraud_status === "challenge") {
                    newStatus = client_1.OrderStatus.PENDING_PAYMENT;
                    paymentStatus = "PENDING";
                }
                else if (fraud_status === "accept") {
                    newStatus = client_1.OrderStatus.PROCESSING;
                    paymentStatus = "PAID";
                }
            }
            else if (transaction_status === "settlement") {
                newStatus = client_1.OrderStatus.PROCESSING;
                paymentStatus = "PAID";
            }
            else if (transaction_status === "cancel" ||
                transaction_status === "deny" ||
                transaction_status === "expire") {
                newStatus = client_1.OrderStatus.CANCELLED;
                paymentStatus = "FAILED";
            }
            await this.orderRepository.updateOrderStatus(order_id, newStatus, {
                paymentStatus,
                paidAt: paymentStatus === "PAID" ? new Date() : null,
            });
            logger_1.default.info(`Order ${order_id} updated to ${newStatus}`);
            res.status(200).json({ status: "OK" });
        }
        catch (error) {
            logger_1.default.error("Webhook Error:", error);
            next(error);
        }
    };
}
exports.PaymentController = PaymentController;
exports.default = PaymentController;
