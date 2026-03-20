import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=20`
    );
    if (!res.ok) {
      return NextResponse.json({ error: `CheapShark returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Search fetch error:', err);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
