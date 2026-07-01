import { ContactInput } from '@whats-up-addis/shared';
import { AppError } from '../middleware/error-handler.js';

export class ContactService {
  async sendContactEmail(data: ContactInput): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.CONTACT_EMAIL_FROM;
    const to = process.env.CONTACT_EMAIL_TO || 'theqemari@gmail.com';

    if (!apiKey || !senderEmail) {
      throw new AppError(500, 'Email service is not configured');
    }

    const body = JSON.stringify({
      sender: { name: "What's Up Addis", email: senderEmail },
      to: [{ email: to }],
      replyTo: { email: data.email, name: data.name },
      subject: `[Contact] ${data.subject}`,
      htmlContent: `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr/>
        <p>${data.message.replace(/\n/g, '<br/>')}</p>
      `,
      textContent: `Name: ${data.name}\nEmail: ${data.email}\n\nSubject: ${data.subject}\n\n${data.message}`,
    });

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Brevo API error:', err);
        throw new Error(`Brevo returned ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to send contact email:', err);
      throw new AppError(
        500,
        'Failed to send message. Please try again later.'
      );
    }
  }
}
