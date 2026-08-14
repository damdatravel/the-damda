import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
  ?? 'AIzaSyBVU0Q5dXWzaERryHomAn3XY8ZTP4TisW4';

export async function GET(req: NextRequest) {
  const latlng = req.nextUrl.searchParams.get('latlng') ?? '';
  const language = req.nextUrl.searchParams.get('language') ?? 'ko';

  if (!latlng) {
    return NextResponse.json({ status: 'INVALID_REQUEST', results: [] });
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${encodeURIComponent(latlng)}` +
      `&key=${GOOGLE_MAPS_API_KEY}` +
      `&language=${language}`;

    const res = await fetch(url);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Geocode Proxy] Error:', e);
    return NextResponse.json(
      { status: 'REQUEST_DENIED', results: [], error_message: 'Server error' },
      { status: 500 },
    );
  }
}
