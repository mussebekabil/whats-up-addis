import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service.js';

const categoryService = new CategoryService();

export class CategoryController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getCategoryBySlug(slug);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async getEventsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await categoryService.getEventsByCategory(slug, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
