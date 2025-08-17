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
    const origins = searchParams.get('origins'); // pipe-separated addresses
    const destinations = searchParams.get('destinations'); // pipe-separated addresses
    const mode = searchParams.get('mode') || 'driving'; // driving, walking, transit, bicycling
    const units = searchParams.get('units') || 'imperial'; // imperial or metric
    const avoidTolls = searchParams.get('avoid_tolls') === 'true';
    const avoidHighways = searchParams.get('avoid_highways') === 'true';
    const departureTime = searchParams.get('departure_time') || 'now';

    // Validate required parameters
    if (!origins || !destinations) {
      return NextResponse.json(
        { error: 'Missing required parameters: origins and destinations' },
        { status: 400 }
      );
    }

    // Build Google Distance Matrix API URL
    const distanceMatrixUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    distanceMatrixUrl.searchParams.set('origins', origins);
    distanceMatrixUrl.searchParams.set('destinations', destinations);
    distanceMatrixUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    distanceMatrixUrl.searchParams.set('mode', mode);
    distanceMatrixUrl.searchParams.set('units', units);
    distanceMatrixUrl.searchParams.set('departure_time', departureTime === 'now' ? 'now' : departureTime);
    
    // Add avoidance preferences
    const avoid = [];
    if (avoidTolls) avoid.push('tolls');
    if (avoidHighways) avoid.push('highways');
    if (avoid.length > 0) {
      distanceMatrixUrl.searchParams.set('avoid', avoid.join('|'));
    }

    // Make request to Google Distance Matrix API
    const response = await fetch(distanceMatrixUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Distance Matrix API error: ${response.status}`);
    }

    const data = await response.json();

    // Process the response for TreeAI-specific needs
    const originAddresses = data.origin_addresses || [];
    const destinationAddresses = data.destination_addresses || [];
    
    // Create processed matrix with TreeAI-specific calculations
    const processedRows = data.rows?.map((row: any, originIndex: number) => ({
      origin_address: originAddresses[originIndex],
      elements: row.elements?.map((element: any, destIndex: number) => {
        if (element.status === 'OK') {
          const distanceMeters = element.distance?.value || 0;
          const durationSeconds = element.duration?.value || 0;
          const durationInTrafficSeconds = element.duration_in_traffic?.value || durationSeconds;
          
          return {
            destination_address: destinationAddresses[destIndex],
            status: element.status,
            distance: {
              text: element.distance?.text,
              value: distanceMeters,
              miles: Math.round(distanceMeters / 1609.34 * 100) / 100,
              kilometers: Math.round(distanceMeters / 1000 * 100) / 100
            },
            duration: {
              text: element.duration?.text,
              value: durationSeconds,
              minutes: Math.round(durationSeconds / 60),
              hours: Math.round(durationSeconds / 3600 * 100) / 100
            },
            duration_in_traffic: element.duration_in_traffic ? {
              text: element.duration_in_traffic.text,
              value: durationInTrafficSeconds,
              minutes: Math.round(durationInTrafficSeconds / 60),
              hours: Math.round(durationInTrafficSeconds / 3600 * 100) / 100
            } : null,
            // TreeAI-specific calculations
            treeai_metrics: {
              estimated_fuel_cost: Math.round(distanceMeters / 1609.34 * 0.15 * 100) / 100, // $0.15/mile
              crew_travel_time: Math.round(durationInTrafficSeconds / 60), // minutes for scheduling
              traffic_delay: Math.round((durationInTrafficSeconds - durationSeconds) / 60), // minutes
              efficiency_score: durationSeconds > 0 ? Math.round((distanceMeters / 1609.34) / (durationSeconds / 3600) * 10) / 10 : 0, // mph
              is_efficient: (durationInTrafficSeconds - durationSeconds) < (durationSeconds * 0.25), // less than 25% delay
              recommended_departure: departureTime === 'now' ? 'immediate' : 'scheduled'
            }
          };
        } else {
          return {
            destination_address: destinationAddresses[destIndex],
            status: element.status,
            error: 'Could not calculate route'
          };
        }
      }) || []
    })) || [];

    // Calculate summary metrics for TreeAI scheduling
    const validElements = processedRows.flatMap(row => 
      row.elements.filter(el => el.status === 'OK')
    );

    const summaryMetrics = {
      total_routes: validElements.length,
      total_distance_miles: validElements.reduce((sum, el) => sum + (el.distance?.miles || 0), 0),
      total_travel_time_minutes: validElements.reduce((sum, el) => sum + (el.duration?.minutes || 0), 0),
      total_travel_time_with_traffic: validElements.reduce((sum, el) => sum + (el.duration_in_traffic?.minutes || el.duration?.minutes || 0), 0),
      total_fuel_cost: validElements.reduce((sum, el) => sum + (el.treeai_metrics?.estimated_fuel_cost || 0), 0),
      average_efficiency: validElements.length > 0 ? 
        validElements.reduce((sum, el) => sum + (el.treeai_metrics?.efficiency_score || 0), 0) / validElements.length : 0,
      routes_with_delays: validElements.filter(el => el.treeai_metrics?.traffic_delay > 5).length,
      efficient_routes: validElements.filter(el => el.treeai_metrics?.is_efficient).length
    };

    return NextResponse.json({
      origin_addresses: originAddresses,
      destination_addresses: destinationAddresses,
      rows: processedRows,
      summary_metrics: summaryMetrics,
      status: data.status
    });

  } catch (error) {
    console.error('Distance Matrix API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance matrix' },
      { status: 500 }
    );
  }
}

// POST method for complex route optimization requests
export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      work_orders, 
      crew_location, 
      optimize_for = 'time', // 'time', 'distance', 'fuel'
      max_travel_time = 480, // minutes (8 hours)
      departure_time = 'now'
    } = body;

    if (!work_orders || !Array.isArray(work_orders) || work_orders.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: work_orders array' },
        { status: 400 }
      );
    }

    if (work_orders.length > 25) {
      return NextResponse.json(
        { error: 'Maximum 25 work orders allowed per optimization request' },
        { status: 400 }
      );
    }

    // Prepare origins and destinations
    const origins = crew_location ? [crew_location] : [];
    const destinations = work_orders.map(wo => wo.address).filter(Boolean);
    
    if (destinations.length === 0) {
      return NextResponse.json(
        { error: 'No valid addresses found in work orders' },
        { status: 400 }
      );
    }

    // If we have crew location, include it; otherwise use first job as starting point
    const allLocations = crew_location ? [crew_location, ...destinations] : destinations;
    const matrixOrigins = allLocations.join('|');
    const matrixDestinations = allLocations.join('|');

    // Call Distance Matrix API
    const distanceMatrixUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    distanceMatrixUrl.searchParams.set('origins', matrixOrigins);
    distanceMatrixUrl.searchParams.set('destinations', matrixDestinations);
    distanceMatrixUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    distanceMatrixUrl.searchParams.set('mode', 'driving');
    distanceMatrixUrl.searchParams.set('units', 'imperial');
    distanceMatrixUrl.searchParams.set('departure_time', departure_time === 'now' ? 'now' : departure_time);

    const response = await fetch(distanceMatrixUrl.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Distance Matrix API returned: ${data.status}` },
        { status: 400 }
      );
    }

    // Build optimization results
    const routes = work_orders.map((workOrder, index) => {
      const destIndex = crew_location ? index + 1 : index;
      const originIndex = 0; // Always start from first location (crew or first job)
      
      const element = data.rows[originIndex]?.elements[destIndex];
      
      if (element?.status === 'OK') {
        const travelTime = element.duration_in_traffic?.value || element.duration?.value || 0;
        const distance = element.distance?.value || 0;
        
        return {
          work_order_id: workOrder.id,
          address: workOrder.address,
          estimated_duration: workOrder.estimated_duration || 120, // minutes
          travel_time: Math.round(travelTime / 60), // minutes
          distance_miles: Math.round(distance / 1609.34 * 100) / 100,
          fuel_cost: Math.round(distance / 1609.34 * 0.15 * 100) / 100,
          total_time: Math.round(travelTime / 60) + (workOrder.estimated_duration || 120),
          priority_score: workOrder.priority === 'urgent' ? 10 : 
                         workOrder.priority === 'high' ? 7 :
                         workOrder.priority === 'medium' ? 5 : 3,
          optimization_score: this.calculateOptimizationScore(
            travelTime, distance, workOrder, optimize_for
          )
        };
      }
      
      return {
        work_order_id: workOrder.id,
        address: workOrder.address,
        error: 'Could not calculate route',
        travel_time: 999,
        optimization_score: 0
      };
    }).filter(route => !route.error);

    // Sort routes based on optimization criteria
    const optimizedRoutes = routes.sort((a, b) => {
      if (optimize_for === 'time') {
        return a.total_time - b.total_time;
      } else if (optimize_for === 'distance') {
        return a.distance_miles - b.distance_miles;
      } else if (optimize_for === 'fuel') {
        return a.fuel_cost - b.fuel_cost;
      }
      return b.optimization_score - a.optimization_score;
    });

    // Calculate summary
    const totalTravelTime = optimizedRoutes.reduce((sum, route) => sum + route.travel_time, 0);
    const totalWorkTime = optimizedRoutes.reduce((sum, route) => sum + route.estimated_duration, 0);
    const totalDistance = optimizedRoutes.reduce((sum, route) => sum + route.distance_miles, 0);
    const totalFuelCost = optimizedRoutes.reduce((sum, route) => sum + route.fuel_cost, 0);

    return NextResponse.json({
      optimized_routes: optimizedRoutes,
      optimization_summary: {
        total_jobs: optimizedRoutes.length,
        total_travel_time: totalTravelTime,
        total_work_time: totalWorkTime,
        total_day_time: totalTravelTime + totalWorkTime,
        total_distance_miles: Math.round(totalDistance * 100) / 100,
        total_fuel_cost: Math.round(totalFuelCost * 100) / 100,
        optimization_criteria: optimize_for,
        within_time_limit: (totalTravelTime + totalWorkTime) <= max_travel_time,
        efficiency_rating: totalDistance > 0 ? Math.round((optimizedRoutes.length / totalDistance) * 10) / 10 : 0
      },
      crew_location: crew_location,
      optimization_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize routes' },
      { status: 500 }
    );
  }
}

// Helper function for optimization scoring
function calculateOptimizationScore(
  travelTime: number, 
  distance: number, 
  workOrder: any, 
  optimizeFor: string
): number {
  const timeScore = Math.max(0, 100 - (travelTime / 60)); // Less time = higher score
  const distanceScore = Math.max(0, 100 - (distance / 1609.34)); // Less distance = higher score
  const priorityScore = workOrder.priority === 'urgent' ? 50 : 
                       workOrder.priority === 'high' ? 30 :
                       workOrder.priority === 'medium' ? 15 : 0;

  if (optimizeFor === 'time') {
    return timeScore * 0.7 + priorityScore * 0.3;
  } else if (optimizeFor === 'distance') {
    return distanceScore * 0.7 + priorityScore * 0.3;
  } else if (optimizeFor === 'fuel') {
    return distanceScore * 0.5 + timeScore * 0.2 + priorityScore * 0.3;
  }

  return (timeScore + distanceScore) / 2 + priorityScore * 0.2;
}