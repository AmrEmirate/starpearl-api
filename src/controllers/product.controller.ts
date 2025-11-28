import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public createProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.productService.createProduct(
        req.user.id,
        req.body
      );

      res.status(201).send({
        success: true,
        message: "Product created successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in createProduct controller", error);
      next(error);
    }
  };

  public getMyProducts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.productService.getStoreProducts(req.user.id);

      res.status(200).send({
        success: true,
        message: "Store products retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getMyProducts controller", error);
      next(error);
    }
  };

  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Ekstrak query params
      const { q, category, minPrice, maxPrice } = req.query;

      const queryParams = {
        q: q as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const result = await this.productService.getAllProducts(queryParams);

      res.status(200).send({
        success: true,
        message: "Products retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getAllProducts controller", error);
      next(error);
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.productService.getProductById(id);

      res.status(200).send({
        success: true,
        message: "Product retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getProductById controller", error);
      next(error);
    }
  };

  public updateProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id } = req.params;
      const result = await this.productService.updateProduct(
        req.user.id,
        id,
        req.body
      );

      res.status(200).send({
        success: true,
        message: "Product updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateProduct controller", error);
      next(error);
    }
  };

  public deleteProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id } = req.params;
      const result = await this.productService.deleteProduct(req.user.id, id);

      res.status(200).send({
        success: true,
        message: "Product deleted successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in deleteProduct controller", error);
      next(error);
    }
  };
}

export default ProductController;
