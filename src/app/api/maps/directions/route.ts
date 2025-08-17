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
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const waypoints = searchParams.get('waypoints'); // comma-separated addresses
    const mode = searchParams.get('mode') || 'driving'; // driving, walking, transit, bicycling
    const avoidTolls = searchParams.get('avoid_tolls') === 'true';
    const avoidHighways = searchParams.get('avoid_highways') === 'true';
    const optimize = searchParams.get('optimize') === 'true'; // optimize waypoint order

    // Validate required parameters
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin and destination' },
        { status: 400 }
      );
    }

    // Build Google Directions API URL
    const directionsUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
    directionsUrl.searchParams.set('origin', origin);
    directionsUrl.searchParams.set('destination', destination);
    directionsUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    directionsUrl.searchParams.set('mode', mode);
    directionsUrl.searchParams.set('departure_time', 'now'); // For real-time traffic
    
    // Add waypoints if provided
    if (waypoints) {
      let waypointString = waypoints;
      if (optimize) {
        waypointString = 'optimize:true|' + waypoints;
      }
      directionsUrl.searchParams.set('waypoints', waypointString);
    }
    
    // Add avoidance preferences
    const avoid = [];
    if (avoidTolls) avoid.push('tolls');
    if (avoidHighways) avoid.push('highways');
    if (avoid.length > 0) {
      directionsUrl.searchParams.set('avoid', avoid.join('|'));
    }

    // Make request to Google Directions API
    const response = await fetch(directionsUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Directions API error: ${response.status}`);
    }

    const data = await response.json();

    // Process the response for TreeAI-specific needs
    const processedRoutes = data.routes?.map((route: any) => ({
      summary: route.summary,
      distance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0),
      duration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
      duration_in_traffic: route.legs.reduce((total: number, leg: any) => 
        total + (leg.duration_in_traffic?.value || leg.duration.value), 0),
      start_address: route.legs[0]?.start_address,
      end_address: route.legs[route.legs.length - 1]?.end_address,
      waypoint_order: route.waypoint_order,
      legs: route.legs.map((leg: any) => ({
        distance: leg.distance,
        duration: leg.duration,
        duration_in_traffic: leg.duration_in_traffic,
        start_address: leg.start_address,
        end_address: leg.end_address,
        start_location: leg.start_location,
        end_location: leg.end_location,
        steps: leg.steps?.length || 0
      })),
      polyline: route.overview_polyline?.points
    })) || [];

    // Calculate TreeAI-specific metrics
    const bestRoute = processedRoutes[0];
    const metrics = bestRoute ? {
      totalDistance: Math.round(bestRoute.distance / 1609.34 * 100) / 100, // miles
      totalDuration: Math.round(bestRoute.duration / 60), // minutes
      totalDurationWithTraffic: Math.round(bestRoute.duration_in_traffic / 60), // minutes
      trafficDelay: Math.round((bestRoute.duration_in_traffic - bestRoute.duration) / 60), // minutes
      estimatedFuelCost: Math.round(bestRoute.distance / 1609.34 * 0.15 * 100) / 100, // $0.15/mile estimate
      crewTravelTime: Math.round(bestRoute.duration_in_traffic / 60), // for crew scheduling
      jobsInRoute: waypoints ? waypoints.split('|').length : 1
    } : null;

    return NextResponse.json({
      routes: processedRoutes,
      metrics,
      status: data.status,
      optimized_waypoints: data.routes?.[0]?.waypoint_order || []
    });

  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}