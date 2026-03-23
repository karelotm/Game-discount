import { NextRequest, NextResponse } from 'next/server';
import { db, emailSubscriptions } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET — list user's email subscriptions
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subs = await db()
    .select()
    .from(emailSubscriptions)
    .where(eq(emailSubscriptions.userId, session.userId));

  return NextResponse.json(subs);
}

// POST — subscribe to a notification type
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type } = await req.json();
  const validTypes = ['free_games', 'weekly_deals', 'sale_alerts'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 });
  }

  // Upsert — reactivate if exists
  const existing = await db()
    .select()
    .from(emailSubscriptions)
    .where(and(eq(emailSubscriptions.userId, session.userId), eq(emailSubscriptions.type, type)))
    .limit(1);

  if (existing.length > 0) {
    await db()
      .update(emailSubscriptions)
      .set({ isActive: true })
      .where(eq(emailSubscriptions.id, existing[0].id));
    return NextResponse.json(existing[0]);
  }

  const [sub] = await db().insert(emailSubscriptions).values({
    userId: session.userId,
    type,
  }).returning();

  return NextResponse.json(sub, { status: 201 });
}

// DELETE — unsubscribe
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

  await db()
    .update(emailSubscriptions)
    .set({ isActive: false })
    .where(and(eq(emailSubscriptions.userId, session.userId), eq(emailSubscriptions.type, type)));

  return NextResponse.json({ ok: true });
}
