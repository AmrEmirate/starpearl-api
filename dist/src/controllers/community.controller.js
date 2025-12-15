"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const community_service_1 = require("../services/community.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
class CommunityController {
    communityService;
    constructor() {
        this.communityService = new community_service_1.CommunityService();
    }
    getPosts = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await this.communityService.getAllPosts(page, limit, req.user?.id);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    createPost = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { content, imageUrl } = req.body;
            const result = await this.communityService.createPost(req.user.id, content, imageUrl);
            res.status(201).send({
                success: true,
                message: "Post created successfully and pending approval",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    likePost = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { postId } = req.params;
            const result = await this.communityService.likePost(req.user.id, postId);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    addComment = async (req, res, next) => {
        try {
            if (!req.user)
                throw new AppError_1.default("Unauthorized", 401);
            const { postId } = req.params;
            const { content } = req.body;
            const result = await this.communityService.addComment(req.user.id, postId, content);
            res.status(201).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getComments = async (req, res, next) => {
        try {
            const { postId } = req.params;
            const comments = await this.communityService.getComments(postId);
            res.status(200).send({
                success: true,
                data: comments,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = CommunityController;
