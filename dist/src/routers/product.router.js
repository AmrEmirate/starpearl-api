"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const product_1 = require("../middleware/validation/product");
class ProductRouter {
    route;
    productController;
    reviewController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.productController = new product_controller_1.default();
        this.reviewController = new review_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.get("/", this.productController.getAllProducts);
        this.route.get("/my-products", this.authMiddleware.verifyToken, this.authMiddleware.isSeller, this.productController.getMyProducts);
        this.route.get("/:id", this.productController.getProductById);
        this.route.post("/", this.authMiddleware.verifyToken, this.authMiddleware.isSeller, product_1.createProductValidation, this.productController.createProduct);
        this.route.patch("/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSeller, this.productController.updateProduct);
        this.route.delete("/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSeller, this.productController.deleteProduct);
        this.route.get("/:id/reviews", this.reviewController.getProductReviews);
        this.route.post("/:id/reviews", this.authMiddleware.verifyToken, this.reviewController.addReview);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = ProductRouter;
