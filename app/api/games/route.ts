import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams();

  const title = searchParams.get('title');
  const id = searchParams.get('id');
  const steamAppID = searchParams.get('steamAppID');
  const limit = searchParams.get('limit');

  if (id) {
    params.set('id', id);
  } else if (steamAppID) {
    params.set('steamAppID', steamAppID);
  } else if (title) {
    params.set('title', title);
    if (limit) params.set('limit', limit);
  } else {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: `CheapShark returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Games fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
