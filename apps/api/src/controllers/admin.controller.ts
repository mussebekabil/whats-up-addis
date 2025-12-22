import { Response, NextFunction } from 'express';
import {
  createCrawlerSourceSchema,
  updateCrawlerSourceSchema,
  EventStatus,
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

  async getEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const events = await adminService.getPendingEvents(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20,
        status as string | undefined
      );
      res.json(events);
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(EventStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const event = await adminService.updateEventStatus(id, status);
      res.json(event);
    } catch (error) {
      next(error);
    }
  }
}
