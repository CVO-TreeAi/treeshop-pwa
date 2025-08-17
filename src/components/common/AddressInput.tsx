"use client";

import { useEffect, useRef } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface AddressInputProps {
  value: string;
  onChange: (address: string, place?: any) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address", 
  required = false,
  className = ""
}: AddressInputProps) {
  const { isLoaded, isLoading, error } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place.formatted_address) {
          onChange(place.formatted_address, {
            placeId: place.place_id,
            geometry: place.geometry,
            addressComponents: place.address_components,
            name: place.name
          });
        }
      });
    }
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPinIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={`w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground ${className}`}
      />
      {(isLoading || error) && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          ) : error ? (
            <div className="w-4 h-4 text-red-500" title={error}>⚠</div>
          ) : null}
        </div>
      )}
    </div>
  );
}