import { Response, NextFunction } from "express";
import { ChatService } from "../services/chat.service";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  public initChat = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { storeId } = req.body; // If buyer starts chat

      if (!storeId) throw new AppError("Store ID required", 400);

      const room = await this.chatService.getOrCreateRoom(req.user.id, storeId);

      res.status(200).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  };

  public getMyRooms = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const rooms = await this.chatService.getUserRooms(
        req.user.id,
        req.user.role === "SELLER" ? "SELLER" : "BUYER"
      );

      res.status(200).json({ success: true, data: rooms });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roomId } = req.params;
      const messages = await this.chatService.getRoomMessages(roomId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { roomId } = req.params;
      const { content } = req.body;

      const message = await this.chatService.sendMessage(
        roomId,
        req.user.id,
        content
      );

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
