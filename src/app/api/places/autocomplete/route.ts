import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
  ?? 'AIzaSyBVU0Q5dXWzaERryHomAn3XY8ZTP4TisW4';

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('input') ?? '';
  const language = req.nextUrl.searchParams.get('language') ?? 'ko';

  if (!input || input.length < 2) {
    return NextResponse.json({ status: 'ZERO_RESULTS', predictions: [] });
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}` +
      `&key=${GOOGLE_MAPS_API_KEY}` +
      `&language=${language}` +
      `&components=country:kr` +
      `&types=establishment|geocode`;

    const res = await fetch(url);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Places Autocomplete Proxy] Error:', e);
    return NextResponse.json(
      { status: 'REQUEST_DENIED', predictions: [], error_message: 'Server error' },
      { status: 500 },
    );
  }
}
