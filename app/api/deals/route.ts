import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams({
    storeID: searchParams.get('storeID') || '1',
    pageSize: searchParams.get('pageSize') || '20',
    sortBy: searchParams.get('sortBy') || 'Deal Rating',
    onSale: '1',
  });

  const optional = ['upperPrice', 'lowerPrice', 'metacritic', 'pageNumber', 'steamRating', 'title'];
  for (const key of optional) {
    const val = searchParams.get(key);
    if (val) params.set(key, val);
  }

  try {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: `CheapShark returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Deals fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}
