import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  public getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  public updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.updateCategory(id, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);
      res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default CategoryController;
