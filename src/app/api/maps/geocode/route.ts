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
    const address = searchParams.get('address');
    const components = searchParams.get('components'); // Optional country/region filter
    const region = searchParams.get('region'); // Bias results to region

    // Validate required parameters
    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Build Google Geocoding API URL
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.set('address', address);
    geocodeUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    
    // Add optional parameters
    if (components) {
      geocodeUrl.searchParams.set('components', components);
    }
    if (region) {
      geocodeUrl.searchParams.set('region', region);
    }

    // Make request to Google Geocoding API
    const response = await fetch(geocodeUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    // Process the response for TreeAI-specific needs
    const processedResults = data.results?.map((result: any) => ({
      formatted_address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      location_type: result.geometry.location_type,
      viewport: result.geometry.viewport,
      place_id: result.place_id,
      types: result.types,
      address_components: result.address_components?.map((component: any) => ({
        long_name: component.long_name,
        short_name: component.short_name,
        types: component.types
      })),
      // TreeAI-specific processing
      confidence: result.geometry.location_type === 'ROOFTOP' ? 'high' : 
                  result.geometry.location_type === 'RANGE_INTERPOLATED' ? 'medium' : 'low',
      postal_code: result.address_components?.find((c: any) => c.types.includes('postal_code'))?.long_name,
      city: result.address_components?.find((c: any) => c.types.includes('locality'))?.long_name,
      state: result.address_components?.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name,
      county: result.address_components?.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name,
      country: result.address_components?.find((c: any) => c.types.includes('country'))?.short_name
    })) || [];

    // Calculate TreeAI-specific metrics for the best result
    const bestResult = processedResults[0];
    const metrics = bestResult ? {
      accuracyLevel: bestResult.confidence,
      serviceArea: bestResult.city && bestResult.state ? `${bestResult.city}, ${bestResult.state}` : null,
      zipCode: bestResult.postal_code,
      isResidential: bestResult.types?.includes('premise') || bestResult.types?.includes('street_address'),
      isCommercial: bestResult.types?.includes('establishment') || bestResult.types?.includes('point_of_interest'),
      coordinatesPrecision: bestResult.location_type
    } : null;

    return NextResponse.json({
      results: processedResults,
      metrics,
      status: data.status,
      total_results: processedResults.length
    });

  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}

// POST method for batch geocoding
export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: addresses array' },
        { status: 400 }
      );
    }

    if (addresses.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 addresses allowed per batch request' },
        { status: 400 }
      );
    }

    // Process each address
    const results = await Promise.all(
      addresses.map(async (address: string, index: number) => {
        try {
          const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
          geocodeUrl.searchParams.set('address', address);
          geocodeUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);

          const response = await fetch(geocodeUrl.toString());
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
              input_address: address,
              index,
              status: 'success',
              formatted_address: result.formatted_address,
              coordinates: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng
              },
              place_id: result.place_id,
              confidence: result.geometry.location_type === 'ROOFTOP' ? 'high' : 
                         result.geometry.location_type === 'RANGE_INTERPOLATED' ? 'medium' : 'low'
            };
          } else {
            return {
              input_address: address,
              index,
              status: 'failed',
              error: data.status || 'No results found'
            };
          }
        } catch (error) {
          return {
            input_address: address,
            index,
            status: 'error',
            error: 'Request failed'
          };
        }
      })
    );

    return NextResponse.json({
      batch_results: results,
      total_processed: addresses.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status !== 'success').length
    });

  } catch (error) {
    console.error('Batch geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch geocoding' },
      { status: 500 }
    );
  }
}