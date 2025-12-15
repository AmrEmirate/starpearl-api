"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../services/auth.service");
const logger_1 = __importDefault(require("../utils/logger"));
const createToken_1 = require("../utils/createToken");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    registerBuyer = async (req, res, next) => {
        try {
            const result = await this.authService.registerBuyer(req.body);
            res.status(201).send({
                success: true,
                message: "Buyer registered successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in registerBuyer controller", error);
            next(error);
        }
    };
    registerSeller = async (req, res, next) => {
        try {
            const result = await this.authService.registerSeller(req.body);
            res.status(201).send({
                success: true,
                message: "Seller registration pending approval",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in registerSeller controller", error);
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const result = await this.authService.login(req.body);
            res.status(200).send({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in login controller", error);
            next(error);
        }
    };
    changeProfileImg = async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                throw new Error("User not authenticated");
            }
            if (!req.file) {
                throw new Error("No file uploaded");
            }
            const result = await this.authService.updateProfileImage(req.user.id, req.file);
            res.status(200).send({
                success: true,
                ...result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in changeProfileImg controller", error);
            next(error);
        }
    };
    googleCallback = async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new Error("Authentication failed");
            }
            const token = (0, createToken_1.createToken)(user, "24h");
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL;
            res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
        }
        catch (error) {
            logger_1.default.error("Error in googleCallback controller", error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const result = await this.authService.resetPassword(req.body);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    confirmResetPassword = async (req, res, next) => {
        try {
            const result = await this.authService.confirmResetPassword(req.body);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = AuthController;
