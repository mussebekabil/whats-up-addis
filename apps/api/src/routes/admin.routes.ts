import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Roles } from '@whats-up-addis/shared';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(Roles.Admin));

router.get('/crawler/sources', adminController.getCrawlerSources);
router.get('/crawler/sources/:id', adminController.getCrawlerSourceById);
router.post('/crawler/sources', adminController.createCrawlerSource);
router.put('/crawler/sources/:id', adminController.updateCrawlerSource);
router.delete('/crawler/sources/:id', adminController.deleteCrawlerSource);
router.post('/crawler/run', adminController.triggerCrawl);

export default router;
