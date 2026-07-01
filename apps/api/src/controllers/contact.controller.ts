import { Request, Response, NextFunction } from 'express';
import { contactSchema } from '@whats-up-addis/shared';
import { ContactService } from '../services/contact.service.js';

const contactService = new ContactService();

export class ContactController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = contactSchema.parse(req.body);
      await contactService.sendContactEmail(data);
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      next(error);
    }
  }
}
