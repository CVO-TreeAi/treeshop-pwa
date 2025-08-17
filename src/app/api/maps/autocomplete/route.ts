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
    const input = searchParams.get('input');
    const sessionToken = searchParams.get('sessiontoken');

    // Validate required parameters
    if (!input) {
      return NextResponse.json(
        { error: 'Missing required parameter: input' },
        { status: 400 }
      );
    }

    // Build Google Places API URL
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    placesUrl.searchParams.set('input', input);
    placesUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    placesUrl.searchParams.set('types', 'address');
    
    if (sessionToken) {
      placesUrl.searchParams.set('sessiontoken', sessionToken);
    }

    // Make request to Google Places API
    const response = await fetch(placesUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Return the predictions
    return NextResponse.json({
      predictions: data.predictions || [],
      status: data.status
    });

  } catch (error) {
    console.error('Address autocomplete error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address suggestions' },
      { status: 500 }
    );
  }
}