"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_service_1 = require("../services/admin.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
class AdminController {
    adminService;
    constructor() {
        this.adminService = new admin_service_1.AdminService();
    }
    getStats = async (req, res, next) => {
        try {
            const stats = await this.adminService.getDashboardStats();
            res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    };
    getPendingStores = async (req, res, next) => {
        try {
            const stores = await this.adminService.getPendingStores();
            res.status(200).json({ success: true, data: stores });
        }
        catch (error) {
            next(error);
        }
    };
    verifyStore = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!["APPROVED", "REJECTED"].includes(status)) {
                throw new AppError_1.default("Invalid status", 400);
            }
            const store = await this.adminService.verifyStore(id, status);
            res.status(200).json({ success: true, data: store });
        }
        catch (error) {
            next(error);
        }
    };
    getPendingWithdrawals = async (req, res, next) => {
        try {
            const withdrawals = await this.adminService.getPendingWithdrawals();
            res.status(200).json({ success: true, data: withdrawals });
        }
        catch (error) {
            next(error);
        }
    };
    processWithdrawal = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!["APPROVED", "REJECTED"].includes(status)) {
                throw new AppError_1.default("Invalid status", 400);
            }
            const withdrawal = await this.adminService.processWithdrawal(id, status);
            res.status(200).json({ success: true, data: withdrawal });
        }
        catch (error) {
            next(error);
        }
    };
    // Settings
    getSettings = async (req, res, next) => {
        try {
            const settings = await this.adminService.getSettings();
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            next(error);
        }
    };
    updateSettings = async (req, res, next) => {
        try {
            const settings = await this.adminService.updateSettings(req.body);
            res.status(200).json({ success: true, data: settings });
        }
        catch (error) {
            next(error);
        }
    };
    // Content
    getBanners = async (req, res, next) => {
        try {
            const banners = await this.adminService.getBanners();
            res.status(200).json({ success: true, data: banners });
        }
        catch (error) {
            next(error);
        }
    };
    createBanner = async (req, res, next) => {
        try {
            const banner = await this.adminService.createBanner(req.body);
            res.status(201).json({ success: true, data: banner });
        }
        catch (error) {
            next(error);
        }
    };
    updateBanner = async (req, res, next) => {
        try {
            const { id } = req.params;
            const banner = await this.adminService.updateBanner(id, req.body);
            res.status(200).json({ success: true, data: banner });
        }
        catch (error) {
            next(error);
        }
    };
    deleteBanner = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.adminService.deleteBanner(id);
            res.status(200).json({ success: true, message: "Banner deleted" });
        }
        catch (error) {
            next(error);
        }
    };
    // Promotions
    getPromotions = async (req, res, next) => {
        try {
            const promotions = await this.adminService.getPromotions();
            res.status(200).json({ success: true, data: promotions });
        }
        catch (error) {
            next(error);
        }
    };
    createPromotion = async (req, res, next) => {
        try {
            const promotion = await this.adminService.createPromotion(req.body);
            res.status(201).json({ success: true, data: promotion });
        }
        catch (error) {
            next(error);
        }
    };
    updatePromotion = async (req, res, next) => {
        try {
            const { id } = req.params;
            const promotion = await this.adminService.updatePromotion(id, req.body);
            res.status(200).json({ success: true, data: promotion });
        }
        catch (error) {
            next(error);
        }
    };
    deletePromotion = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.adminService.deletePromotion(id);
            res.status(200).json({ success: true, message: "Promotion deleted" });
        }
        catch (error) {
            next(error);
        }
    };
    // Community Moderation
    getPendingPosts = async (req, res, next) => {
        try {
            const result = await this.adminService.getPendingPosts();
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    moderatePost = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await this.adminService.moderatePost(id, status);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    // Disputes
    getDisputes = async (req, res, next) => {
        try {
            const result = await this.adminService.getDisputes();
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    resolveDispute = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await this.adminService.resolveDispute(id, { status });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    // User Management
    getAllUsers = async (req, res, next) => {
        try {
            const { role, search, page, limit } = req.query;
            const result = await this.adminService.getAllUsers({
                role: role,
                search: search,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    suspendUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.adminService.suspendUser(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.adminService.deleteUser(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    resetUserPassword = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword) {
                throw new AppError_1.default("New password is required", 400);
            }
            const result = await this.adminService.resetUserPassword(id, newPassword);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    // Enhanced Reporting
    getSalesReport = async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query;
            const result = await this.adminService.getSalesReport({
                startDate: startDate,
                endDate: endDate,
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    getServiceFeeReport = async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query;
            const result = await this.adminService.getServiceFeeReport({
                startDate: startDate,
                endDate: endDate,
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    getTrafficReport = async (req, res, next) => {
        try {
            const result = await this.adminService.getTrafficReport();
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = AdminController;
