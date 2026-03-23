import { NextRequest, NextResponse } from 'next/server';
import { db, priceAlerts } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PATCH /api/alerts — update alert targets for a watchlist item
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, targetPrice, targetPct, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (targetPrice !== undefined) updates.targetPrice = targetPrice;
  if (targetPct !== undefined) updates.targetPct = targetPct;
  if (isActive !== undefined) updates.isActive = isActive;

  const [updated] = await db()
    .update(priceAlerts)
    .set(updates)
    .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, session.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(updated);
}
