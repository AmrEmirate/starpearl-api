"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_service_1 = require("../services/category.service");
class CategoryController {
    categoryService;
    constructor() {
        this.categoryService = new category_service_1.CategoryService();
    }
    getAllCategories = async (req, res, next) => {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            next(error);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            const category = await this.categoryService.createCategory(req.body);
            res.status(201).json({ success: true, data: category });
        }
        catch (error) {
            next(error);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const category = await this.categoryService.updateCategory(id, req.body);
            res.status(200).json({ success: true, data: category });
        }
        catch (error) {
            next(error);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.categoryService.deleteCategory(id);
            res.status(200).json({ success: true, message: "Category deleted" });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = CategoryController;
