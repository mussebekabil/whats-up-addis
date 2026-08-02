const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

export async function sendEmail({
  to,
  toName,
  subject,
  htmlContent,
}: {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.CONTACT_EMAIL_FROM;

  if (!apiKey || !senderEmail) {
    throw new Error('BREVO_API_KEY or CONTACT_EMAIL_FROM not configured');
  }

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: "What's Up Addis", email: senderEmail },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo error ${res.status}: ${JSON.stringify(err)}`);
  }
}
