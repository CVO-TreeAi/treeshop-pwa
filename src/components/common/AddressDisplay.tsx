"use client";

import { useState } from 'react';
import { ClipboardIcon, CheckIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { formatAddressForGPS, type ValidatedAddress } from '@/utils/addressValidation';

interface AddressDisplayProps {
  address: string;
  validatedAddress?: ValidatedAddress;
  showCopyButton?: boolean;
  showMapLinks?: boolean;
  className?: string;
}

export function AddressDisplay({ 
  address, 
  validatedAddress,
  showCopyButton = true,
  showMapLinks = true,
  className = ""
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getMapLinks = () => {
    if (validatedAddress) {
      return formatAddressForGPS(validatedAddress);
    }
    
    // Fallback for non-validated addresses
    const encoded = encodeURIComponent(address);
    return {
      formatted: address,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      appleMapsUrl: `http://maps.apple.com/?q=${encoded}`,
      wazeUrl: `https://waze.com/ul?q=${encoded}&navigate=yes`
    };
  };

  const mapLinks = getMapLinks();

  const openMapApp = (url: string) => {
    window.open(url, '_blank');
    setShowMapOptions(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Address Display */}
      <div className="flex items-start space-x-2">
        <MapPinIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground break-words">{address}</p>
          {validatedAddress && validatedAddress.confidence && (
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                validatedAddress.confidence === 'high' ? 'bg-green-500' : 
                validatedAddress.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-muted-foreground">
                Verification: {validatedAddress.confidence}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(showCopyButton || showMapLinks) && (
        <div className="flex items-center space-x-2">
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              title="Copy address"
            >
              {copied ? (
                <CheckIcon className="w-3 h-3 text-green-600" />
              ) : (
                <ClipboardIcon className="w-3 h-3" />
              )}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}

          {showMapLinks && (
            <div className="relative">
              <button
                onClick={() => setShowMapOptions(!showMapOptions)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                title="Open in maps"
              >
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                <span>Maps</span>
              </button>

              {showMapOptions && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => openMapApp(mapLinks.googleMapsUrl)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-t-lg"
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={() => openMapApp(mapLinks.appleMapsUrl)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    Apple Maps
                  </button>
                  <button
                    onClick={() => openMapApp(mapLinks.wazeUrl)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-b-lg"
                  >
                    Waze
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close map options */}
      {showMapOptions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMapOptions(false)}
        />
      )}
    </div>
  );
}