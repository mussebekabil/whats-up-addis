import { Response, NextFunction } from 'express';
import {
  createCrawlerSourceSchema,
  updateCrawlerSourceSchema,
} from '@whats-up-addis/shared';
import { AdminService } from '../services/admin.service.js';
import { AuthRequest } from '../middleware/auth.js';

const adminService = new AdminService();

export class AdminController {
  async getCrawlerSources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sources = await adminService.getCrawlerSources();
      res.json(sources);
    } catch (error) {
      next(error);
    }
  }

  async getCrawlerSourceById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const source = await adminService.getCrawlerSourceById(id);
      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  async createCrawlerSource(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = createCrawlerSourceSchema.parse(req.body);
      const source = await adminService.createCrawlerSource(data);
      res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }

  async updateCrawlerSource(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const data = updateCrawlerSourceSchema.parse(req.body);
      const source = await adminService.updateCrawlerSource(id, data);
      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  async deleteCrawlerSource(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteCrawlerSource(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  triggerCrawl(req: AuthRequest, res: Response) {
    // This would trigger the crawler service
    // For now, we'll just return a message
    res.json({ message: 'Crawler triggered successfully' });
  }
}
