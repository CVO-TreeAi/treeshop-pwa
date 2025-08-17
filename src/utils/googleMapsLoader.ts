declare global {
  interface Window {
    google: any;
    initMap: () => void;
    googleMapsPromise?: Promise<void>;
  }
}

let isLoading = false;
let isLoaded = false;

export function loadGoogleMapsAPI(): Promise<void> {
  // Return existing promise if already loading
  if (window.googleMapsPromise) {
    return window.googleMapsPromise;
  }

  // Return resolved promise if already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  // Prevent multiple loads
  if (isLoading) {
    return window.googleMapsPromise || Promise.resolve();
  }

  isLoading = true;

  // Create and cache the promise
  window.googleMapsPromise = new Promise<void>((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // If script exists but Google Maps isn't loaded yet, wait for it
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return window.googleMapsPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return !!(window.google && window.google.maps && window.google.maps.places);
}