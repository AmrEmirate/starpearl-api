"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const community_controller_1 = __importDefault(require("../controllers/community.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class CommunityRouter {
    route;
    controller;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.controller = new community_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.get("/", this.authMiddleware.extractUser, this.controller.getPosts);
        // Public route to get comments for a post
        this.route.get("/:postId/comments", this.controller.getComments);
        this.route.use(this.authMiddleware.verifyToken);
        this.route.post("/", this.controller.createPost);
        this.route.post("/:postId/like", this.controller.likePost);
        this.route.post("/:postId/comment", this.controller.addComment);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = CommunityRouter;
