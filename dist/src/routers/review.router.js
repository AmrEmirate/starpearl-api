"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class ReviewRouter {
    route;
    reviewController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.reviewController = new review_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.get("/:id", this.reviewController.getProductReviews);
        this.route.post("/:id", this.authMiddleware.verifyToken, this.reviewController.addReview);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = ReviewRouter;
