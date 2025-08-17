"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { validateAddress, type ValidatedAddress } from '@/utils/addressValidation';

interface AddressPrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface SecureAddressInputProps {
  value: string;
  onChange: (address: string, place?: any) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function SecureAddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address", 
  required = false,
  className = ""
}: SecureAddressInputProps) {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionToken] = useState(() => 
    // Generate a unique session token for Google Places API billing
    Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced autocomplete search
  const searchAddresses = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/maps/autocomplete?input=${encodeURIComponent(input)}&sessiontoken=${sessionToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
      setShowDropdown(data.predictions?.length > 0);
    } catch (error) {
      console.error('Address autocomplete error:', error);
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      searchAddresses(inputValue);
    }, 300);
  };

  // Handle prediction selection
  const handlePredictionSelect = async (prediction: AddressPrediction) => {
    setShowDropdown(false);
    setIsLoading(true);

    try {
      // Fetch detailed place information
      const response = await fetch(
        `/api/maps/place-details?place_id=${prediction.place_id}&sessiontoken=${sessionToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data = await response.json();
      const place = data.result;

      if (place) {
        onChange(place.formatted_address, place);
      } else {
        onChange(prediction.description);
      }
    } catch (error) {
      console.error('Place details error:', error);
      // Fallback to the prediction description
      onChange(prediction.description);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
        className={`w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground ${className}`}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePredictionSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {prediction.structured_formatting ? (
                    <>
                      <div className="font-medium text-foreground">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </>
                  ) : (
                    <div className="text-foreground">{prediction.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}