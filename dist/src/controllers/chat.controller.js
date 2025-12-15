"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_service_1 = require("../services/chat.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
class ChatController {
    chatService;
    constructor() {
        this.chatService = new chat_service_1.ChatService();
    }
    initChat = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { storeId } = req.body; // If buyer starts chat
            if (!storeId)
                throw new AppError_1.default("Store ID required", 400);
            const room = await this.chatService.getOrCreateRoom(req.user.id, storeId);
            res.status(200).json({ success: true, data: room });
        }
        catch (error) {
            next(error);
        }
    };
    getMyRooms = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const rooms = await this.chatService.getUserRooms(req.user.id, req.user.role === "SELLER" ? "SELLER" : "BUYER");
            res.status(200).json({ success: true, data: rooms });
        }
        catch (error) {
            next(error);
        }
    };
    getMessages = async (req, res, next) => {
        try {
            const { roomId } = req.params;
            const messages = await this.chatService.getRoomMessages(roomId);
            res.status(200).json({ success: true, data: messages });
        }
        catch (error) {
            next(error);
        }
    };
    sendMessage = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { roomId } = req.params;
            const { content } = req.body;
            const message = await this.chatService.sendMessage(roomId, req.user.id, content);
            res.status(201).json({ success: true, data: message });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = ChatController;
