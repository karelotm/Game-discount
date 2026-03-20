import { NextRequest, NextResponse } from 'next/server';

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
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
}
