import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import AppError from "../utils/AppError";
import { prisma } from "../config/prisma";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }
  }
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class AuthMiddleware {
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError("Server configuration error", 500));
    }

    try {
      const decoded = verify(token, secret) as { id: string; role: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      req.user = decoded;
      next();
    } catch (err) {
      return next(new AppError("Invalid token", 401));
    }
  }

  async extractUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    try {
      const decoded = verify(token, secret) as { id: string; role: string };
      req.user = decoded;
      next();
    } catch (err) {
      next();
    }
  }

  isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (user?.role !== "ADMIN") {
      return next(new AppError("Forbidden: Admins only", 403));
    }
    next();
  };

  isSeller = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (user?.role !== "SELLER") {
      return next(new AppError("Forbidden: Sellers only", 403));
    }
    next();
  };
}
