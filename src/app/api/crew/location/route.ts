import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
let crewLocations: Map<string, any> = new Map();

// GET - Retrieve crew locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');
    const activeOnly = searchParams.get('active_only') === 'true';
    const withinRadius = searchParams.get('within_radius'); // miles
    const centerLat = searchParams.get('center_lat');
    const centerLng = searchParams.get('center_lng');

    let locations = Array.from(crewLocations.values());

    // Filter by crew ID if specified
    if (crewId) {
      locations = locations.filter(loc => loc.crew_id === crewId);
    }

    // Filter by active status
    if (activeOnly) {
      const cutoffTime = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      locations = locations.filter(loc => loc.timestamp > cutoffTime && loc.status === 'active');
    }

    // Filter by radius if center coordinates provided
    if (withinRadius && centerLat && centerLng) {
      const radiusMiles = parseFloat(withinRadius);
      const centerLatNum = parseFloat(centerLat);
      const centerLngNum = parseFloat(centerLng);
      
      locations = locations.filter(loc => {
        const distance = calculateDistance(
          centerLatNum, centerLngNum,
          loc.coordinates.lat, loc.coordinates.lng
        );
        return distance <= radiusMiles;
      });
    }

    // Add calculated metrics for TreeAI
    const processedLocations = locations.map(location => ({
      ...location,
      time_since_update: Math.round((Date.now() - location.timestamp) / 1000 / 60), // minutes
      is_recent: (Date.now() - location.timestamp) < (5 * 60 * 1000), // within 5 minutes
      accuracy_level: location.accuracy < 10 ? 'high' : location.accuracy < 50 ? 'medium' : 'low',
      movement_status: calculateMovementStatus(location),
      eta_to_jobs: location.assigned_jobs ? calculateETAToJobs(location) : []
    }));

    return NextResponse.json({
      locations: processedLocations,
      total_crews: processedLocations.length,
      active_crews: processedLocations.filter(loc => loc.status === 'active').length,
      recent_updates: processedLocations.filter(loc => loc.is_recent).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Crew location retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve crew locations' },
      { status: 500 }
    );
  }
}

// POST - Update crew location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      crew_id,
      crew_name,
      coordinates,
      accuracy,
      status = 'active',
      current_job,
      assigned_jobs = [],
      notes,
      vehicle_info
    } = body;

    // Validate required fields
    if (!crew_id || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: crew_id, coordinates.lat, coordinates.lng' },
        { status: 400 }
      );
    }

    // Get previous location for movement calculation
    const previousLocation = crewLocations.get(crew_id);
    
    // Create location update
    const locationUpdate = {
      crew_id,
      crew_name: crew_name || `Crew ${crew_id}`,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      accuracy: accuracy || 10,
      status,
      current_job,
      assigned_jobs,
      notes,
      vehicle_info,
      timestamp: Date.now(),
      
      // Movement tracking
      previous_coordinates: previousLocation?.coordinates,
      movement: previousLocation ? {
        distance_moved: calculateDistance(
          previousLocation.coordinates.lat,
          previousLocation.coordinates.lng,
          coordinates.lat,
          coordinates.lng
        ),
        time_since_last_update: Date.now() - previousLocation.timestamp,
        estimated_speed: calculateSpeed(previousLocation, { coordinates, timestamp: Date.now() })
      } : null,
      
      // TreeAI-specific data
      treeai_data: {
        service_area: determineServiceArea(coordinates),
        nearby_customers: [], // Would be populated by customer database lookup
        traffic_zone: determineTrafficZone(coordinates),
        weather_zone: determineWeatherZone(coordinates),
        fuel_stations_nearby: [], // Could be populated by Places API
        equipment_status: vehicle_info?.equipment_status || 'unknown'
      }
    };

    // Store the location
    crewLocations.set(crew_id, locationUpdate);

    // Calculate route metrics if assigned jobs
    let routeMetrics = null;
    if (assigned_jobs.length > 0) {
      routeMetrics = await calculateRouteMetrics(locationUpdate);
    }

    return NextResponse.json({
      success: true,
      crew_id,
      location_updated: true,
      timestamp: new Date(locationUpdate.timestamp).toISOString(),
      movement_detected: !!locationUpdate.movement,
      route_metrics: routeMetrics,
      recommendations: generateRecommendations(locationUpdate)
    });

  } catch (error) {
    console.error('Crew location update error:', error);
    return NextResponse.json(
      { error: 'Failed to update crew location' },
      { status: 500 }
    );
  }
}

// PUT - Update crew status or job assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { crew_id, status, current_job, assigned_jobs, notes } = body;

    if (!crew_id) {
      return NextResponse.json(
        { error: 'Missing required field: crew_id' },
        { status: 400 }
      );
    }

    const existingLocation = crewLocations.get(crew_id);
    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Crew location not found' },
        { status: 404 }
      );
    }

    // Update specific fields
    const updatedLocation = {
      ...existingLocation,
      ...(status && { status }),
      ...(current_job !== undefined && { current_job }),
      ...(assigned_jobs && { assigned_jobs }),
      ...(notes !== undefined && { notes }),
      last_status_update: Date.now()
    };

    crewLocations.set(crew_id, updatedLocation);

    return NextResponse.json({
      success: true,
      crew_id,
      status_updated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Crew status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update crew status' },
      { status: 500 }
    );
  }
}

// DELETE - Remove crew from tracking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crew_id = searchParams.get('crew_id');

    if (!crew_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: crew_id' },
        { status: 400 }
      );
    }

    const existed = crewLocations.has(crew_id);
    crewLocations.delete(crew_id);

    return NextResponse.json({
      success: true,
      crew_id,
      was_tracking: existed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Crew removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove crew from tracking' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateSpeed(previous: any, current: any): number {
  if (!previous.movement) return 0;
  
  const distance = calculateDistance(
    previous.coordinates.lat, previous.coordinates.lng,
    current.coordinates.lat, current.coordinates.lng
  );
  const timeHours = (current.timestamp - previous.timestamp) / (1000 * 60 * 60);
  return timeHours > 0 ? Math.round(distance / timeHours) : 0;
}

function calculateMovementStatus(location: any): string {
  if (!location.movement) return 'unknown';
  
  const speed = location.movement.estimated_speed;
  if (speed < 1) return 'stationary';
  if (speed < 10) return 'walking';
  if (speed < 25) return 'city_driving';
  if (speed < 45) return 'suburban_driving';
  return 'highway_driving';
}

function determineServiceArea(coordinates: any): string {
  // This would integrate with your service area database
  // For now, return a placeholder
  return 'metro_area';
}

function determineTrafficZone(coordinates: any): string {
  // This would integrate with traffic data
  return 'moderate';
}

function determineWeatherZone(coordinates: any): string {
  // This would integrate with weather API
  return 'clear';
}

function calculateETAToJobs(location: any): any[] {
  // This would use the Distance Matrix API to calculate ETAs
  return location.assigned_jobs.map((job: any) => ({
    job_id: job.id,
    estimated_eta: 30, // minutes - placeholder
    distance: 5.2 // miles - placeholder
  }));
}

async function calculateRouteMetrics(location: any): Promise<any> {
  // This would use the route optimization APIs
  return {
    total_distance: 15.5,
    total_time: 120,
    fuel_cost: 8.50,
    efficiency_score: 8.2
  };
}

function generateRecommendations(location: any): string[] {
  const recommendations = [];
  
  if (location.movement?.estimated_speed > 50) {
    recommendations.push('Consider reducing speed for safety');
  }
  
  if (location.assigned_jobs.length > 4) {
    recommendations.push('Heavy job load - consider route optimization');
  }
  
  if (location.treeai_data.traffic_zone === 'heavy') {
    recommendations.push('High traffic area - allow extra travel time');
  }
  
  return recommendations;
}