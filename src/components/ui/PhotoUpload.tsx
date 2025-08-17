"use client";

import { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  PhotoIcon,
  XMarkIcon,
  CameraIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Photo {
  _id: string;
  storageId: string;
  filename: string;
  contentType: string;
  description?: string;
  category?: string;
  uploadedAt: number;
  url?: string;
}

interface PhotoUploadProps {
  entityType: string;
  entityId: string;
  category?: string;
  maxPhotos?: number;
  allowMultiple?: boolean;
  allowCategories?: string[];
  onPhotosChange?: (photos: Photo[]) => void;
  className?: string;
}

export function PhotoUpload({
  entityType,
  entityId,
  category,
  maxPhotos = 10,
  allowMultiple = true,
  allowCategories = ['before', 'during', 'after', 'damage', 'equipment'],
  onPhotosChange,
  className = ''
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Try Convex first, fallback to mock mutations
  const convexUploadPhoto = useMutation(api.photos.uploadPhoto);
  const convexDeletePhoto = useMutation(api.photos.deletePhoto);
  const convexUpdatePhoto = useMutation(api.photos.updatePhoto);
  
  const uploadPhoto = convexUploadPhoto || useMockMutation('photos:uploadPhoto');
  const deletePhoto = convexDeletePhoto || useMockMutation('photos:deletePhoto');
  const updatePhoto = convexUpdatePhoto || useMockMutation('photos:updatePhoto');
  
  // Try Convex first, fallback to mock data
  const convexPhotos = useQuery(api.photos.getPhotosForEntity, {
    entityType,
    entityId,
    category
  });
  const mockPhotos = useMockQuery('photos:getPhotosForEntity', { entityType, entityId, category });
  const photos = convexPhotos || mockPhotos || [];

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const filesToUpload = allowMultiple ? Array.from(files) : [files[0]];

    try {
      for (const file of filesToUpload) {
        if (photos.length >= maxPhotos) {
          alert(`Maximum ${maxPhotos} photos allowed`);
          break;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Convert to bytes for Convex
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        await uploadPhoto({
          data: bytes,
          filename: file.name,
          contentType: file.type,
          entityType,
          entityId,
          category: category || 'general'
        });
      }

      if (onPhotosChange) {
        // Refresh photos and call callback
        const updatedPhotos = await api.photos.getPhotosForEntity({
          entityType,
          entityId,
          category
        });
        onPhotosChange(updatedPhotos);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadPhoto, photos.length, maxPhotos, allowMultiple, entityType, entityId, category, onPhotosChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto({ photoId });
        if (onPhotosChange) {
          const updatedPhotos = photos.filter(p => p._id !== photoId);
          onPhotosChange(updatedPhotos);
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete photo');
      }
    }
  };

  const handleUpdatePhoto = async (photoId: string, updates: { description?: string; category?: string }) => {
    try {
      await updatePhoto({ photoId, ...updates });
      setEditingPhoto(null);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update photo');
    }
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={allowMultiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">Uploading photos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <PhotoIcon className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Upload Photos</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max {maxPhotos} photos • 5MB per file • JPG, PNG, WebP
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Browse Files</span>
              </button>
              
              <button
                onClick={openCamera}
                className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Photos ({photos.length}/{maxPhotos})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo._id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.description || photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePhoto(photo._id)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Photo info */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-foreground font-medium truncate">
                    {photo.description || photo.filename}
                  </p>
                  {photo.category && (
                    <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {photo.category}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedPhoto.description || selectedPhoto.filename}
              </h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || selectedPhoto.filename}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Filename:</span> {selectedPhoto.filename}</p>
                <p><span className="font-medium">Category:</span> {selectedPhoto.category || 'General'}</p>
                <p><span className="font-medium">Uploaded:</span> {new Date(selectedPhoto.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Edit Photo</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  defaultValue={editingPhoto.description || ''}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  placeholder="Enter photo description"
                  onChange={(e) => {
                    setEditingPhoto({ ...editingPhoto, description: e.target.value });
                  }}
                />
              </div>
              
              {allowCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Category
                  </label>
                  <select
                    defaultValue={editingPhoto.category || ''}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    onChange={(e) => {
                      setEditingPhoto({ ...editingPhoto, category: e.target.value });
                    }}
                  >
                    <option value="">Select category</option>
                    {allowCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePhoto(editingPhoto._id, {
                    description: editingPhoto.description,
                    category: editingPhoto.category
                  })}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}