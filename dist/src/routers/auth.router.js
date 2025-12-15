"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const uploader_1 = require("../middleware/uploader");
const auth_1 = require("../middleware/validation/auth");
const auth_middleware_1 = require("../middleware/auth.middleware");
const passport_1 = __importDefault(require("passport"));
class AuthRouter {
    route;
    authController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.authController = new auth_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.post("/register/buyer", auth_1.registerBuyerValidation, this.authController.registerBuyer);
        this.route.post("/register/seller", auth_1.registerSellerValidation, this.authController.registerSeller);
        this.route.post("/login", auth_1.loginValidation, this.authController.login);
        this.route.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
        this.route.get("/google/callback", passport_1.default.authenticate("google", {
            session: false,
            failureRedirect: "/login",
        }), this.authController.googleCallback);
        this.route.patch("/profile-img", this.authMiddleware
            .verifyToken, (0, uploader_1.uploaderMemory)().single("img"), this.authController
            .changeProfileImg);
        this.route.post("/reset-password", this.authController.resetPassword);
        this.route.post("/reset-password/confirm", this.authController.confirmResetPassword);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = AuthRouter;
