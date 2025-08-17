"use client";

import { useState, useEffect } from 'react';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '@/utils/googleMapsLoader';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    // Start loading
    setIsLoading(true);
    setError(null);

    loadGoogleMapsAPI()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load Google Maps');
        setIsLoading(false);
      });
  }, []);

  return { isLoaded, isLoading, error };
}