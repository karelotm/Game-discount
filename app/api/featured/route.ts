import { NextResponse } from 'next/server';

export async function GET() {
  const cc = process.env.STEAM_COUNTRY_CODE || 'us';

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/featuredcategories/?cc=${cc}`,
      { next: { revalidate: 900 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch featured categories' }, { status: 500 });
  }
}
