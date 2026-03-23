import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = () => process.env.RESEND_FROM_EMAIL || 'Steam Deals Hub <alerts@steam-deals-hub.coupons>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log(`[Email] Would send to ${to}: "${subject}" (RESEND_API_KEY not configured)`);
    return false;
  }

  try {
    await resend.emails.send({ from: FROM(), to, subject, html });
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return false;
  }
}

// ── Email Templates ────────────────────────────────────────────

export function priceAlertEmail(gameTitle: string, currentPrice: string, targetPrice: string, dealUrl: string) {
  return {
    subject: `Price Alert: ${gameTitle} is now ${currentPrice}!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 24px; border-radius: 12px;">
        <h1 style="color: #00F0FF; font-size: 20px;">Price Alert Triggered!</h1>
        <p><strong>${gameTitle}</strong> has dropped to <strong style="color: #00F0FF;">${currentPrice}</strong></p>
        <p style="color: #8888AA;">Your target was: ${targetPrice}</p>
        <a href="${dealUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00F0FF; color: #0A0A0F; text-decoration: none; border-radius: 8px; font-weight: bold;">View Deal →</a>
        <hr style="border-color: #1A1A25; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px;">You're receiving this because you set a price alert on Steam Deals Hub.</p>
      </div>
    `,
  };
}

export function freeGameEmail(games: { title: string; url: string; thumb?: string }[]) {
  const gamesList = games
    .map((g) => `<li style="margin-bottom: 8px;"><a href="${g.url}" style="color: #00F0FF;">${g.title}</a> — FREE</li>`)
    .join('');

  return {
    subject: `Free Games Alert: ${games.length} game${games.length > 1 ? 's' : ''} available!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 24px; border-radius: 12px;">
        <h1 style="color: #00F0FF; font-size: 20px;">Free Games Available!</h1>
        <ul style="padding-left: 16px;">${gamesList}</ul>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/free-games" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00F0FF; color: #0A0A0F; text-decoration: none; border-radius: 8px; font-weight: bold;">See All Free Games →</a>
        <hr style="border-color: #1A1A25; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px;">You're receiving this because you subscribed to free game alerts on Steam Deals Hub.</p>
      </div>
    `,
  };
}

export function weeklyDealsEmail(deals: { title: string; salePrice: string; normalPrice: string; savings: string; url: string }[]) {
  const rows = deals
    .map(
      (d) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #1A1A25;"><a href="${d.url}" style="color: #00F0FF;">${d.title}</a></td>
          <td style="padding: 8px; border-bottom: 1px solid #1A1A25; color: #8888AA; text-decoration: line-through;">${d.normalPrice}</td>
          <td style="padding: 8px; border-bottom: 1px solid #1A1A25; color: #00F0FF; font-weight: bold;">${d.salePrice}</td>
          <td style="padding: 8px; border-bottom: 1px solid #1A1A25; color: #FF2D6B;">-${d.savings}%</td>
        </tr>`,
    )
    .join('');

  return {
    subject: "This Week's Top Steam Deals",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 24px; border-radius: 12px;">
        <h1 style="color: #00F0FF; font-size: 20px;">Weekly Deals Digest</h1>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead><tr style="color: #8888AA; font-size: 12px;">
            <th style="text-align: left; padding: 8px;">Game</th>
            <th style="text-align: left; padding: 8px;">Was</th>
            <th style="text-align: left; padding: 8px;">Now</th>
            <th style="text-align: left; padding: 8px;">Off</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/deals" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00F0FF; color: #0A0A0F; text-decoration: none; border-radius: 8px; font-weight: bold;">See All Deals →</a>
        <hr style="border-color: #1A1A25; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px;">You're receiving this because you subscribed to weekly deals on Steam Deals Hub.</p>
      </div>
    `,
  };
}

export function verifyEmail(verifyUrl: string) {
  return {
    subject: 'Verify your Steam Deals Hub account',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 24px; border-radius: 12px;">
        <h1 style="color: #00F0FF; font-size: 20px;">Verify Your Email</h1>
        <p>Click the button below to verify your email address and start receiving alerts.</p>
        <a href="${verifyUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00F0FF; color: #0A0A0F; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email →</a>
        <hr style="border-color: #1A1A25; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px;">If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  };
}
