"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_1 = require("../middleware/validation/user");
class UserRouter {
    route;
    userController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.userController = new user_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.get("/me", this.authMiddleware.verifyToken, this.userController.getMyProfile);
        this.route.patch("/me", this.authMiddleware.verifyToken, user_1.updateUserValidation, this.userController.updateMyProfile);
        this.route.post("/me/password", this.authMiddleware.verifyToken, this.userController.changePassword);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = UserRouter;
