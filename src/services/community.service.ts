import { prisma } from "../config/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class CommunityService {
  
  public async getAllPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const posts = await prisma.communityPost.findMany({
      skip,
      take: limit,
      where: { status: "APPROVED" }, // Only show approved posts
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, role: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const total = await prisma.communityPost.count({ where: { status: "APPROVED" } });

    return {
      posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public async createPost(userId: string, content: string, imageUrl?: string) {
    if (!content && !imageUrl) {
      throw new AppError("Post must have content or an image", 400);
    }

    return await prisma.communityPost.create({
      data: {
        userId,
        content,
        imageUrl,
        status: "PENDING" // Default to pending for moderation
      }
    });
  }

  public async likePost(userId: string, postId: string) {
    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.communityPostLike.delete({
        where: { id: existingLike.id }
      });
      return { liked: false };
    } else {
      // Like
      await prisma.communityPostLike.create({
        data: {
          postId,
          userId
        }
      });
      return { liked: true };
    }
  }

  public async addComment(userId: string, postId: string, content: string) {
    if (!content) throw new AppError("Comment cannot be empty", 400);

    return await prisma.communityComment.create({
      data: {
        postId,
        userId,
        content
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });
  }
}
