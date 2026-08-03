import type { UpcomingEvent } from './event.service.js';

const C = {
  ember: '#e07040',
  emberLight: '#fdf1e8',
  header: '#1e1e28',
  headerSubtext: '#9d9da8',
  foreground: '#2d2d3a',
  muted: '#767683',
  border: '#e5e4de',
  dashedBorder: '#d4d3cc',
  background: '#faf9f4',
  card: '#ffffff',
} as const;

const F = {
  display: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', Courier, monospace",
} as const;

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dateParts(date: Date): {
  day: string;
  month: string;
  year: string;
  time: string;
} {
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

const PLACEHOLDER_IMAGE = `https://placehold.co/560x200/${C.header.slice(1)}/faf9f4?text=Event`;

function eventCard(event: UpcomingEvent, appUrl: string): string {
  const imageUrl = event.imageUrl || PLACEHOLDER_IMAGE;
  const location = event.location || event.venue || 'Addis Ababa';
  const eventUrl = `${appUrl}/events/${event.id}`;
  const { day, month, year, time } = dateParts(new Date(event.startDate));

  return `
    <tr>
      <td class="email-card-body" style="padding:20px 20px;border-bottom:1px solid ${C.border};">
        <!-- Image with overlaid date badge (mirrors the web card) -->
        <div style="position:relative;border-radius:12px;overflow:hidden;line-height:0;margin-bottom:16px;">
          <img src="${imageUrl}" alt="${esc(event.title)}"
            width="100%"
            style="width:100%;height:200px;object-fit:cover;display:block;border-radius:12px;" />
          <!-- Date badge — top-left overlay, matching the web card -->
          <div style="position:absolute;top:10px;left:10px;background:${C.card};border-radius:10px;padding:6px 10px;display:flex;align-items:center;gap:8px;">
            <span style="font-family:${F.display};font-size:26px;font-weight:400;color:${C.foreground};line-height:1;">${day}</span>
            <div>
              <span style="display:block;font-family:${F.mono};font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};line-height:1.4;">${month}</span>
              <span style="display:block;font-family:${F.mono};font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};line-height:1.4;">${year}</span>
            </div>
          </div>
        </div>
        <!-- Category label -->
        <span style="font-family:${F.mono};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${C.ember};">
          ${esc(event.category.name)}
        </span>
        <!-- Title -->
        <h3 style="margin:6px 0 8px;font-size:20px;font-weight:400;color:${C.foreground};
          font-family:${F.display};line-height:1.3;letter-spacing:-0.01em;">
          ${esc(event.title)}
        </h3>
        <!-- Description -->
        <p style="margin:0 0 14px;font-family:${F.sans};font-size:13px;color:${C.muted};line-height:1.55;">
          ${esc(truncate(event.description, 120))}
        </p>
        <!-- Bottom row -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="border-top:1px dashed ${C.dashedBorder};padding-top:12px;">
          <tr>
            <td>
              <span style="display:block;font-family:${F.sans};font-size:12px;color:${C.foreground};font-weight:500;">${esc(location)}</span>
              <span style="display:block;font-family:${F.mono};font-size:11px;color:${C.muted};margin-top:2px;">${time}</span>
            </td>
            <td align="right" valign="middle">
              <a href="${eventUrl}"
                style="font-family:${F.sans};font-size:12px;font-weight:700;color:${C.ember};text-decoration:none;white-space:nowrap;">
                View Event &#8594;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function emailShell(
  title: string,
  subtitle: string,
  eventCards: string,
  viewAllUrl: string,
  unsubscribeHtml: string
): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-card { border-radius: 12px !important; }
      .email-header { padding: 24px 16px !important; }
      .email-card-body { padding: 16px 14px !important; }
      .email-footer { padding: 24px 16px !important; }
      .email-card img { height: 160px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${C.background};">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" class="email-wrapper" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" class="email-card"
          style="width:100%;max-width:600px;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
          <!-- Header -->
          <tr>
            <td class="email-header" style="background:${C.header};padding:28px 24px;text-align:center;">
              <div style="margin:0 0 14px;text-align:center;line-height:1;">
                <span style="display:inline-block;vertical-align:baseline;font-family:${F.display};font-size:24px;font-weight:400;color:#ffffff;line-height:1;margin-right:6px;">What&#8217;s Up</span><!--
                --><span style="display:inline-block;vertical-align:baseline;background:${C.ember};border-radius:6px;padding:4px 9px;font-family:${F.mono};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#ffffff;">Addis</span>
              </div>
              <h1 style="color:#ffffff;margin:0 0 8px;font-size:26px;font-weight:400;
                font-family:'Instrument Serif',Georgia,'Times New Roman',serif;letter-spacing:-0.02em;line-height:1.2;">
                ${title}
              </h1>
              <p style="color:${C.headerSubtext};margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;">
                ${subtitle}
              </p>
            </td>
          </tr>
          <!-- Event cards -->
          ${eventCards}
          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding:28px 24px;text-align:center;border-top:1px solid ${C.border};
              background:${C.background};">
              <a href="${viewAllUrl}"
                style="display:inline-block;background:${C.ember};color:#ffffff;
                  padding:12px 32px;border-radius:8px;text-decoration:none;
                  font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                  font-weight:700;font-size:14px;letter-spacing:0.01em;">
                View All Upcoming Events
              </a>
              <p style="margin:20px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${C.muted};font-size:12px;line-height:1.6;">
                ${unsubscribeHtml}
              </p>
              <p style="margin:12px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#b0afb8;font-size:11px;">
                &copy; ${year} What&#8217;s Up Addis &mdash; Addis Ababa, Ethiopia
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildDigestEmail({
  userName,
  events,
  appUrl,
  unsubscribeUrl,
}: {
  userName: string;
  events: UpcomingEvent[];
  appUrl: string;
  unsubscribeUrl: string;
}): string {
  const cards = events.map((e) => eventCard(e, appUrl)).join('');
  return emailShell(
    'Upcoming Events in Your Categories',
    `Hi ${esc(userName.split(' ')[0])}, here are upcoming events in your subscribed categories`,
    cards,
    `${appUrl}/events?filter=upcoming`,
    `You&#8217;re receiving this because you subscribed to event categories on What&#8217;s Up Addis.<br/>
     <a href="${unsubscribeUrl}" style="color:${C.ember};">Manage your subscriptions</a>`
  );
}

export function buildGenericEmail({
  events,
  appUrl,
  unsubscribeUrl,
}: {
  events: UpcomingEvent[];
  appUrl: string;
  unsubscribeUrl: string;
}): string {
  const cards = events.map((e) => eventCard(e, appUrl)).join('');
  return emailShell(
    'Events You Might Like',
    'Upcoming events in Addis Ababa you might be interested in',
    cards,
    `${appUrl}/events?filter=upcoming`,
    `You&#8217;re receiving this as a registered What&#8217;s Up Addis user.<br/>
     <a href="${unsubscribeUrl}" style="color:${C.ember};">Manage email preferences</a>`
  );
}
