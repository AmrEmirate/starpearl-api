"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../services/user.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    getMyProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.userService.getUserProfile(req.user.id);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getMyProfile controller", error);
            next(error);
        }
    };
    updateMyProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.userService.updateUserProfile(req.user.id, req.body);
            res.status(200).send({
                success: true,
                message: "Profile updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateMyProfile controller", error);
            next(error);
        }
    };
    changePassword = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                throw new AppError_1.default("Old password and new password are required", 400);
            }
            const result = await this.userService.changePassword(req.user.id, {
                oldPassword,
                newPassword,
            });
            res.status(200).send({
                success: true,
                message: "Password updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in changePassword controller", error);
            next(error);
        }
    };
}
exports.default = UserController;
