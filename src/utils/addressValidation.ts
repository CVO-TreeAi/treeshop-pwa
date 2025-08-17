export interface AddressComponents {
  streetNumber?: string;
  route?: string;
  locality?: string;
  administrativeAreaLevel1?: string;
  postalCode?: string;
  country?: string;
}

export interface ValidatedAddress {
  formatted: string;
  components: AddressComponents;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
}

export function parseAddressComponents(addressComponents: any[]): AddressComponents {
  const components: AddressComponents = {};
  
  addressComponents.forEach((component) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      components.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      components.route = component.long_name;
    } else if (types.includes('locality')) {
      components.locality = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      components.administrativeAreaLevel1 = component.short_name;
    } else if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    } else if (types.includes('country')) {
      components.country = component.long_name;
    }
  });
  
  return components;
}

export function validateAddress(place: any): ValidatedAddress {
  if (!place || !place.formatted_address) {
    return {
      formatted: '',
      components: {},
      isValid: false,
      confidence: 'low'
    };
  }

  const components = place.address_components ? 
    parseAddressComponents(place.address_components) : {};
  
  // Determine confidence based on available data
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  if (place.geometry && components.streetNumber && components.route) {
    confidence = 'high';
  } else if (place.geometry && (components.route || components.locality)) {
    confidence = 'medium';
  }

  return {
    formatted: place.formatted_address,
    components,
    coordinates: place.geometry ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : undefined,
    placeId: place.place_id,
    isValid: true,
    confidence
  };
}

export function formatAddressForDisplay(address: ValidatedAddress): string {
  const { components } = address;
  
  if (!components.route) {
    return address.formatted;
  }
  
  let display = '';
  
  if (components.streetNumber) {
    display += components.streetNumber + ' ';
  }
  
  display += components.route;
  
  if (components.locality) {
    display += ', ' + components.locality;
  }
  
  if (components.administrativeAreaLevel1) {
    display += ', ' + components.administrativeAreaLevel1;
  }
  
  if (components.postalCode) {
    display += ' ' + components.postalCode;
  }
  
  return display || address.formatted;
}

export function formatAddressForGPS(address: ValidatedAddress): {
  formatted: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  wazeUrl: string;
} {
  const encoded = encodeURIComponent(address.formatted);
  
  return {
    formatted: address.formatted,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    appleMapsUrl: `http://maps.apple.com/?q=${encoded}`,
    wazeUrl: `https://waze.com/ul?q=${encoded}&navigate=yes`
  };
}