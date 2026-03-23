import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db, emailSubscriptions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/email/unsubscribe?token=xxx
 * One-click unsubscribe from email notifications.
 * Token is a JWT containing { userId, type }.
 */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    const type = payload.type as string;

    await db()
      .update(emailSubscriptions)
      .set({ isActive: false })
      .where(and(eq(emailSubscriptions.userId, userId), eq(emailSubscriptions.type, type)));

    return new NextResponse(
      `<html><body style="background:#0A0A0F;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="text-align:center;"><h1 style="color:#00F0FF;">Unsubscribed</h1><p>You've been unsubscribed from ${type.replace('_', ' ')} notifications.</p></div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } },
    );
  } catch {
    return new NextResponse('Invalid or expired token', { status: 400 });
  }
}
