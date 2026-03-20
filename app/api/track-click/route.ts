import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Lightweight click-tracking endpoint.
 * Receives beacon/POST from AffiliateLink component.
 *
 * Currently logs to console (visible in Vercel function logs).
 * To persist data, connect to a database or analytics service:
 *   - Vercel KV / Upstash Redis (simple counters)
 *   - Vercel Postgres (full click log)
 *   - PostHog / Plausible (event analytics)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealID, storeName, timestamp } = body;

    // Log for Vercel function logs — replace with DB insert when ready
    console.log('[affiliate-click]', {
      dealID,
      storeName,
      timestamp,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      ua: request.headers.get('user-agent') ?? 'unknown',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
