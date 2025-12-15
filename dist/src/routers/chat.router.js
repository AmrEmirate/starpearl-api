"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
class ChatRouter {
    route;
    chatController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.chatController = new chat_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.post("/init", this.chatController.initChat);
        this.route.get("/rooms", this.chatController.getMyRooms);
        this.route.get("/rooms/:roomId/messages", this.chatController.getMessages);
        this.route.post("/rooms/:roomId/messages", this.chatController.sendMessage);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = ChatRouter;
