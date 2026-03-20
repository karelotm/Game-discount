import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const headers = {
  'User-Agent': 'SteamDealsHub/1.0 (Next.js; Vercel)',
  'Accept': 'application/json',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appids = searchParams.get('appids');

  if (!appids) {
    return NextResponse.json({ error: 'Missing appids parameter' }, { status: 400 });
  }

  const cc = searchParams.get('cc') || process.env.STEAM_COUNTRY_CODE || 'us';

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails/?appids=${appids}&cc=${cc}`,
      { headers }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Steam returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Game detail fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
}
