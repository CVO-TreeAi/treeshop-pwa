"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery } from '@/hooks/useMockConvex';
import { 
  PhotoIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface PhotoGalleryProps {
  entityType: string;
  entityId: string;
  category?: string;
  showUploadButton?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function PhotoGallery({
  entityType,
  entityId,
  category,
  showUploadButton = false,
  maxDisplay = 6,
  className = ''
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Try Convex first, fallback to mock data
  const convexPhotos = useQuery(api.photos.getPhotosForEntity, {
    entityType,
    entityId,
    category
  });
  const mockPhotos = useMockQuery('photos:getPhotosForEntity', { entityType, entityId, category });
  const photos = convexPhotos || mockPhotos || [];

  const displayPhotos = photos.slice(0, maxDisplay);
  const hasMore = photos.length > maxDisplay;

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  if (photos.length === 0) {
    return showUploadButton ? (
      <div className={`text-center py-8 ${className}`}>
        <PhotoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No photos yet</p>
      </div>
    ) : null;
  }

  return (
    <div className={className}>
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {displayPhotos.map((photo, index) => (
          <div
            key={photo._id}
            className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={photo.url}
              alt={photo.description || photo.filename}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Show more indicator */}
        {hasMore && (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="text-center">
              <PhotoIcon className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">
                +{photos.length - maxDisplay} more
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                disabled={selectedIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={nextPhoto}
                disabled={selectedIndex === photos.length - 1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Photo Container */}
          <div className="flex items-center justify-center w-full h-full p-4">
            <div className="max-w-4xl max-h-full">
              <img
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].description || photos[selectedIndex].filename}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Photo Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-4 text-white">
                <h3 className="font-medium mb-1">
                  {photos[selectedIndex].description || photos[selectedIndex].filename}
                </h3>
                <div className="flex items-center justify-between text-sm opacity-80">
                  <span>
                    {photos[selectedIndex].category && (
                      <span className="bg-white/20 px-2 py-1 rounded-full mr-2">
                        {photos[selectedIndex].category}
                      </span>
                    )}
                    {new Date(photos[selectedIndex].uploadedAt).toLocaleDateString()}
                  </span>
                  <span>{selectedIndex + 1} of {photos.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}