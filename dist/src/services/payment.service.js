"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
const crypto_1 = __importDefault(require("crypto"));
class PaymentService {
    snap;
    core;
    constructor() {
        const isProduction = process.env.NODE_ENV === "production";
        this.snap = new midtrans_client_1.default.Snap({
            isProduction: false, // Always Sandbox for now as requested
            serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder",
        });
        this.core = new midtrans_client_1.default.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder",
        });
    }
    async generateSnapToken(order) {
        try {
            const parameter = {
                transaction_details: {
                    order_id: order.id,
                    gross_amount: Number(order.totalAmount),
                },
                customer_details: {
                    first_name: "Customer", // In real app, fetch from User
                    email: "customer@example.com", // In real app, fetch from User
                },
            };
            const transaction = await this.snap.createTransaction(parameter);
            logger_1.default.info(`Generated Snap Token for order ${order.id}: ${transaction.token}`);
            return transaction.token;
        }
        catch (error) {
            logger_1.default.error("Midtrans Snap Error:", error);
            throw new AppError_1.default("Failed to generate payment token", 500);
        }
    }
    verifySignature(orderId, statusCode, grossAmount, signatureKey) {
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder";
        const input = orderId + statusCode + grossAmount + serverKey;
        const signature = crypto_1.default.createHash("sha512").update(input).digest("hex");
        return signature === signatureKey;
    }
}
exports.PaymentService = PaymentService;
