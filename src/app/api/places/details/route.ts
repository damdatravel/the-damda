import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
  ?? 'AIzaSyBVU0Q5dXWzaERryHomAn3XY8ZTP4TisW4';

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('place_id') ?? '';

  if (!placeId) {
    return NextResponse.json({ status: 'INVALID_REQUEST', result: null });
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=geometry` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Places Details Proxy] Error:', e);
    return NextResponse.json(
      { status: 'REQUEST_DENIED', result: null, error_message: 'Server error' },
      { status: 500 },
    );
  }
}
