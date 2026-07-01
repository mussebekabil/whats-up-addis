import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller.js';
import { authLimiter } from '../middleware/rate-limit.js';

const router = Router();
const contactController = new ContactController();

router.post('/', authLimiter, contactController.submit.bind(contactController));

export default router;
