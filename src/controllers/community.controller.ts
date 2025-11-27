import { Response, NextFunction } from "express";
import { CommunityService } from "../services/community.service";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

  public getPosts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      
      const result = await this.communityService.getAllPosts(page, limit);
      
      res.status(200).send({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  public createPost = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      
      const { content, imageUrl } = req.body;
      const result = await this.communityService.createPost(req.user.id, content, imageUrl);
      
      res.status(201).send({
        success: true,
        message: "Post created successfully and pending approval",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  public likePost = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      
      const { postId } = req.params;
      const result = await this.communityService.likePost(req.user.id, postId);
      
      res.status(200).send({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  public addComment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      
      const { postId } = req.params;
      const { content } = req.body;
      
      const result = await this.communityService.addComment(req.user.id, postId, content);
      
      res.status(201).send({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommunityController;
