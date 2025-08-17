import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // Validate API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const sessionToken = searchParams.get('sessiontoken');

    // Validate required parameters
    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: place_id' },
        { status: 400 }
      );
    }

    // Build Google Place Details API URL
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId);
    detailsUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    detailsUrl.searchParams.set('fields', 'address_components,formatted_address,geometry,name,place_id');
    
    if (sessionToken) {
      detailsUrl.searchParams.set('sessiontoken', sessionToken);
    }

    // Make request to Google Place Details API
    const response = await fetch(detailsUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Place Details API error: ${response.status}`);
    }

    const data = await response.json();

    // Return the place details
    return NextResponse.json({
      result: data.result || null,
      status: data.status
    });

  } catch (error) {
    console.error('Place details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}