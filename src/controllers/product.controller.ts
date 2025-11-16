import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware"; // Import tipe RequestWithUser
import AppError from "../utils/AppError";

class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public createProduct = async (
    req: RequestWithUser, // Gunakan RequestWithUser
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Pastikan user ada di request (dari AuthMiddleware)
      if (!req.user || !req.user.id) {
        throw new AppError("Authentication failed", 401);
      }

      const userId = req.user.id;
      const productData = req.body;

      const result = await this.productService.addProduct(userId, productData);

      res.status(201).send({
        success: true,
        message: "Product added successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in createProduct controller", error);
      next(error);
    }
  };

  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.productService.getProducts();
      res.status(200).send({
        success: true,
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
      if (!id) {
        throw new AppError("Product ID is required", 400);
      }

      const result = await this.productService.getProductById(id);
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getProductById controller", error);
      next(error);
    }
  };

  // Handler lain (getProduct, updateProduct, deleteProduct) akan ditambahkan di sini
}

export default ProductController;