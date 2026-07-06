import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '@whats-up-addis/shared';
import { AuthService } from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await authService.getMe(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const users = await authService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' });
  }
}
