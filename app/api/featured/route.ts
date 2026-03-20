import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cc = process.env.STEAM_COUNTRY_CODE || 'us';

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/featuredcategories/?cc=${cc}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Steam returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Featured fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch featured categories' }, { status: 500 });
  }
}
