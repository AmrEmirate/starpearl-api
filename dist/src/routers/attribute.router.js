"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attribute_controller_1 = __importDefault(require("../controllers/attribute.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class AttributeRouter {
    route;
    controller;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.controller = new attribute_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public route to get attributes (for sellers/buyers)
        this.route.get("/", this.controller.getAllAttributes);
        // Admin only routes
        this.route.use(this.authMiddleware.verifyToken);
        this.route.use(this.authMiddleware.isAdmin);
        this.route.post("/", this.controller.createAttribute);
        this.route.post("/:id/values", this.controller.addAttributeValue);
        this.route.delete("/:id", this.controller.deleteAttribute);
        this.route.delete("/values/:id", this.controller.deleteAttributeValue);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = AttributeRouter;
