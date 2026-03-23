import { NextRequest, NextResponse } from 'next/server';
import { db, priceAlerts } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/watchlist — list user's watchlist items
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await db()
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.userId, session.userId))
    .orderBy(priceAlerts.createdAt);

  return NextResponse.json(items);
}

// POST /api/watchlist — add game to watchlist (optionally with alert targets)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { gameTitle, steamAppId, cheapsharkGameId, targetPrice, targetPct, currentPrice, thumb } = body;

  if (!gameTitle) {
    return NextResponse.json({ error: 'gameTitle is required' }, { status: 400 });
  }

  const [item] = await db().insert(priceAlerts).values({
    userId: session.userId,
    gameTitle,
    steamAppId: steamAppId || null,
    cheapsharkGameId: cheapsharkGameId || null,
    targetPrice: targetPrice || null,
    targetPct: targetPct || null,
    currentPrice: currentPrice || null,
    thumb: thumb || null,
  }).returning();

  return NextResponse.json(item, { status: 201 });
}

// DELETE /api/watchlist?id=xxx — remove item from watchlist
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db()
    .delete(priceAlerts)
    .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, session.userId)));

  return NextResponse.json({ ok: true });
}
