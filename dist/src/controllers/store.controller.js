"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_service_1 = require("../services/store.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class StoreController {
    storeService;
    constructor() {
        this.storeService = new store_service_1.StoreService();
    }
    getMyStore = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.storeService.getMyStore(req.user.id);
            res.status(200).send({
                success: true,
                message: "Store profile retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getMyStore controller", error);
            next(error);
        }
    };
    updateMyStore = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.storeService.updateMyStore(req.user.id, req.body);
            res.status(200).send({
                success: true,
                message: "Store profile updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateMyStore controller", error);
            next(error);
        }
    };
    getDashboardStats = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const store = await this.storeService.getMyStore(req.user.id);
            if (!store) {
                throw new AppError_1.default("Store not found", 404);
            }
            const AnalyticsService = require("../services/analytics.service").AnalyticsService;
            const analyticsService = new AnalyticsService();
            const stats = await analyticsService.getStoreStats(store.id);
            res.status(200).send({
                success: true,
                message: "Dashboard stats retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getDashboardStats controller", error);
            next(error);
        }
    };
    submitVerification = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { idCardUrl, businessLicenseUrl } = req.body;
            if (!idCardUrl || !businessLicenseUrl) {
                throw new AppError_1.default("ID Card and Business License URLs are required", 400);
            }
            const result = await this.storeService.submitVerification(req.user.id, {
                idCardUrl,
                businessLicenseUrl,
            });
            res.status(200).send({
                success: true,
                message: "Verification submitted successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in submitVerification controller", error);
            next(error);
        }
    };
    getStoreById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.storeService.getStoreById(id);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    followStore = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Authentication failed", 401);
            const { id } = req.params;
            const result = await this.storeService.followStore(req.user.id, id);
            res.status(200).send({
                success: true,
                message: "Followed store successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    unfollowStore = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Authentication failed", 401);
            const { id } = req.params;
            await this.storeService.unfollowStore(req.user.id, id);
            res.status(200).send({
                success: true,
                message: "Unfollowed store successfully",
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = StoreController;
