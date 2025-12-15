"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voucher_service_1 = require("../services/voucher.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
const prisma_1 = require("../config/prisma");
class VoucherController {
    voucherService;
    constructor() {
        this.voucherService = new voucher_service_1.VoucherService();
    }
    createVoucher = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const store = await prisma_1.prisma.store.findUnique({
                where: { userId: req.user.id },
            });
            if (!store)
                throw new AppError_1.default("Store not found", 404);
            const { code, description, discountType, discountValue, minPurchase, maxUses, expiresAt, } = req.body;
            const voucher = await this.voucherService.createVoucher(store.id, {
                code,
                description,
                discountType,
                discountValue: Number(discountValue),
                minPurchase: Number(minPurchase || 0),
                maxUses: maxUses ? Number(maxUses) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            });
            res.status(201).json({ success: true, data: voucher });
        }
        catch (error) {
            next(error);
        }
    };
    getMyVouchers = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const vouchers = await this.voucherService.getStoreVouchers(req.user.id);
            res.status(200).json({ success: true, data: vouchers });
        }
        catch (error) {
            next(error);
        }
    };
    deleteVoucher = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { id } = req.params;
            await this.voucherService.deleteVoucher(req.user.id, id);
            res.status(200).json({ success: true, message: "Voucher deleted" });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = VoucherController;
