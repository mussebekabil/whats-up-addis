import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { apiLimiter } from '../middleware/rate-limit.js';

const router = Router();
const categoryController = new CategoryController();

router.get('/', apiLimiter, categoryController.getCategories);
router.get('/:slug', apiLimiter, categoryController.getCategoryBySlug);
router.get('/:slug/events', apiLimiter, categoryController.getEventsByCategory);

export default router;
