import { Response, NextFunction } from 'express';
import {
  createEventSchema,
  updateEventSchema,
  eventFiltersSchema,
} from '@whats-up-addis/shared';
import { EventService } from '../services/event.service.js';
import { AuthRequest } from '../middleware/auth.js';

const eventService = new EventService();

export class EventController {
  async getEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = eventFiltersSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        isFree: req.query.isFree ? req.query.isFree === 'true' : undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        endDateGte: req.query.endDateGte as string | undefined,
        endDateLt: req.query.endDateLt as string | undefined,
      });

      const result = await eventService.getEvents(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);
      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = createEventSchema.parse(req.body);
      const event = await eventService.createEvent(data, req.user.id);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = updateEventSchema.parse(req.body);
      const event = await eventService.updateEvent(
        id,
        data,
        req.user.id,
        req.user.role
      );
      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await eventService.deleteEvent(
        id,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await eventService.searchEvents(q as string, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
