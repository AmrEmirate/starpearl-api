"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class CommunityService {
    async getAllPosts(page = 1, limit = 10, userId) {
        const skip = (page - 1) * limit;
        const posts = await prisma_1.prisma.communityPost.findMany({
            skip,
            take: limit,
            where: { status: "APPROVED" }, // Only show approved posts
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true, role: true },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
                likes: userId
                    ? {
                        where: { userId: userId },
                        select: { userId: true },
                    }
                    : false,
            },
            orderBy: { createdAt: "desc" },
        });
        const total = await prisma_1.prisma.communityPost.count({
            where: { status: "APPROVED" },
        });
        const postsWithLikeStatus = posts.map((post) => ({
            ...post,
            isLiked: post.likes ? post.likes.length > 0 : false,
            likes: undefined, // Remove the likes array from response
        }));
        return {
            posts: postsWithLikeStatus,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createPost(userId, content, imageUrl) {
        if (!content && !imageUrl) {
            throw new AppError_1.default("Post must have content or an image", 400);
        }
        return await prisma_1.prisma.communityPost.create({
            data: {
                userId,
                content,
                imageUrl,
                status: "PENDING", // Default to pending for moderation
            },
        });
    }
    async likePost(userId, postId) {
        const existingLike = await prisma_1.prisma.communityPostLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (existingLike) {
            await prisma_1.prisma.communityPostLike.delete({
                where: { id: existingLike.id },
            });
            return { liked: false };
        }
        else {
            await prisma_1.prisma.communityPostLike.create({
                data: {
                    postId,
                    userId,
                },
            });
            return { liked: true };
        }
    }
    async addComment(userId, postId, content) {
        if (!content)
            throw new AppError_1.default("Comment cannot be empty", 400);
        return await prisma_1.prisma.communityComment.create({
            data: {
                postId,
                userId,
                content,
            },
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
    }
    async getComments(postId) {
        return await prisma_1.prisma.communityComment.findMany({
            where: { postId },
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });
    }
}
exports.CommunityService = CommunityService;
