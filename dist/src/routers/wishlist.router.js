"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = __importDefault(require("../controllers/wishlist.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class WishlistRouter {
    route;
    wishlistController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.wishlistController = new wishlist_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.get("/", this.wishlistController.getMyWishlist);
        this.route.post("/", this.wishlistController.addToWishlist);
        this.route.delete("/:id", this.wishlistController.removeFromWishlist);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = WishlistRouter;
