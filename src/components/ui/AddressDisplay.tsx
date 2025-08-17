"use client";

import { useState } from 'react';
import { 
  MapPinIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { formatAddressForGPS } from '@/utils/workflowAutomation';

interface AddressDisplayProps {
  address: string;
  showLabel?: boolean;
  className?: string;
}

export function AddressDisplay({ address, showLabel = true, className = "" }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const addressData = formatAddressForGPS(address);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInMaps = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <div className="text-sm text-muted-foreground mb-1 flex items-center space-x-1">
          <MapPinIcon className="w-3 h-3" />
          <span>Property Address</span>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div 
            className="text-sm text-foreground bg-muted px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => copyToClipboard(addressData.formatted)}
          >
            {addressData.formatted}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Copy Button */}
          <button
            onClick={() => copyToClipboard(addressData.formatted)}
            className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs hover:bg-primary/20 transition-colors"
            title="Copy address"
          >
            {copied ? (
              <CheckIcon className="w-3 h-3" />
            ) : (
              <ClipboardDocumentIcon className="w-3 h-3" />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          {/* GPS Apps Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center space-x-1 bg-info/10 text-info px-2 py-1 rounded-lg text-xs hover:bg-info/20 transition-colors"
              title="Open in GPS app"
            >
              <MapPinIcon className="w-3 h-3" />
              <span>GPS</span>
              <ChevronDownIcon className="w-3 h-3" />
            </button>
            
            {showOptions && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptions(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[140px]">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        openInMaps(addressData.googleMapsUrl);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span>Google Maps</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        openInMaps(addressData.appleMapsUrl);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span>Apple Maps</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        openInMaps(addressData.wazeUrl);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 bg-cyan-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <span>Waze</span>
                    </button>
                    
                    <hr className="border-border my-1" />
                    
                    <button
                      onClick={() => {
                        copyToClipboard(addressData.formatted);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy Address</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Distance & Travel Time (would integrate with maps API) */}
      <div className="mt-1 text-xs text-muted-foreground">
        📍 Tap address to copy • Use GPS button for navigation
      </div>
    </div>
  );
}