import { Router } from "express";
import ChatController from "../controllers/chat.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class ChatRouter {
  private route: Router;
  private chatController: ChatController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.chatController = new ChatController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.use(this.authMiddleware.verifyToken);

    this.route.post("/init", this.chatController.initChat);
    this.route.get("/rooms", this.chatController.getMyRooms);
    this.route.get("/rooms/:roomId/messages", this.chatController.getMessages);
    this.route.post("/rooms/:roomId/messages", this.chatController.sendMessage);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default ChatRouter;
