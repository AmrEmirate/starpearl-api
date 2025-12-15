"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const withdrawal_service_1 = require("../services/withdrawal.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
class WithdrawalController {
    withdrawalService;
    constructor() {
        this.withdrawalService = new withdrawal_service_1.WithdrawalService();
    }
    requestWithdrawal = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { amount, bankName, bankAccount, bankUser } = req.body;
            if (!amount || !bankName || !bankAccount || !bankUser) {
                throw new AppError_1.default("Missing required fields", 400);
            }
            const result = await this.withdrawalService.requestWithdrawal(req.user.id, Number(amount), bankName, bankAccount, bankUser);
            res.status(201).json({
                success: true,
                message: "Withdrawal requested successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getMyWithdrawals = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const result = await this.withdrawalService.getStoreWithdrawals(req.user.id);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getBalance = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const balance = await this.withdrawalService.getStoreBalance(req.user.id);
            res.status(200).json({
                success: true,
                data: { balance },
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = WithdrawalController;
