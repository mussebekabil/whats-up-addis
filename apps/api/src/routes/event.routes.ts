import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rate-limit.js';

const router = Router();
const eventController = new EventController();

router.get('/', apiLimiter, eventController.getEvents);
router.get('/search', apiLimiter, eventController.searchEvents);
router.get('/:id', apiLimiter, eventController.getEventById);
router.post('/', authenticate, eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);

export default router;
