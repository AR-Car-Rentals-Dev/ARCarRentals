import { type FC, useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  GripVertical,
  Star,
  Loader2,
  Trash2,
} from 'lucide-react';
import { supabase } from '@services/supabase';

export interface ImageUploadItem {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
  isPrimary?: boolean;
}

interface MultiImageUploadProps {
  images: ImageUploadItem[];
  onChange: (images: ImageUploadItem[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

/**
 * Multi-Image Upload Component
 * Supports drag-and-drop reordering (first image is primary)
 * Like Facebook posts - first image is always the primary one
 */
export const MultiImageUpload: FC<MultiImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max limit
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Create preview items immediately
    const newImages: ImageUploadItem[] = filesToAdd.map((file) => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      url: URL.createObjectURL(file),
      file,
      isUploading: true,
      isPrimary: images.length === 0, // First image is primary
    }));

    // Add to list with uploading state
    onChange([...images, ...newImages]);

    // Upload each file
    const uploadedImages: ImageUploadItem[] = [];
    for (const item of newImages) {
      if (item.file) {
        try {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `vehicles/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(filePath, item.file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            // Keep the local preview URL as fallback
            uploadedImages.push({
              ...item,
              isUploading: false,
            });
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage.from('vehicle-images').getPublicUrl(filePath);

            uploadedImages.push({
              id: `uploaded-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              url: publicUrl,
              isUploading: false,
              isPrimary: item.isPrimary,
            });
          }
        } catch (err) {
          console.error('Error uploading:', err);
          uploadedImages.push({
            ...item,
            isUploading: false,
          });
        }
      }
    }

    // Update with uploaded URLs
    const updatedImages = images.filter(
      (img) => !img.id.startsWith('temp-')
    );
    onChange([...updatedImages, ...uploadedImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);

    // If we removed the primary image, make the first one primary
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }

    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    // Move the primary image to the front (Facebook-style)
    const primaryImage = newImages.splice(index, 1)[0];
    newImages.unshift(primaryImage);

    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    // Update primary status - first image is always primary
    newImages.forEach((img, i) => {
      img.isPrimary = i === 0;
    });

    setDraggedIndex(index);
    onChange(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleUrlInput = (url: string) => {
    if (!url.trim()) return;

    const newImage: ImageUploadItem = {
      id: `url-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      url: url.trim(),
      isPrimary: images.length === 0,
    };

    onChange([...images, newImage]);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable={!disabled && !image.isUploading}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-xl overflow-hidden border-2 ${
                index === 0
                  ? 'border-primary-500 col-span-3 aspect-video'
                  : 'border-neutral-200 aspect-square'
              } ${draggedIndex === index ? 'opacity-50' : ''} ${
                !disabled ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              <img
                src={image.url}
                alt={`Vehicle image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80';
                }}
              />

              {/* Primary Badge - Always on first image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Uploading Overlay */}
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {/* Hover Actions */}
              {!disabled && !image.isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Drag Handle */}
                  <div className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg">
                    <GripVertical className="w-4 h-4 text-neutral-600" />
                  </div>

                  {/* Set as Primary - Only show for non-first images */}
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="p-2 bg-white text-yellow-600 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Set as primary image"
                      aria-label="Set as primary image"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && !disabled && (
        <>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
              <Upload className="h-7 w-7 text-primary-600" />
            </div>
            <p className="text-neutral-700 font-medium mb-1">
              {images.length === 0
                ? 'Click or drag files to upload'
                : 'Add more images'}
            </p>
            <p className="text-neutral-500 text-sm">
              PNG, JPG up to 5MB - {maxImages - images.length} remaining
            </p>
            {images.length === 0 && (
              <p className="text-xs text-neutral-400 mt-2">
                First image will be used as the primary image
              </p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-neutral-500 uppercase tracking-wide">
                OR USE URL
              </span>
            </div>
          </div>

          {/* URL Input */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-5 w-5 text-neutral-600" />
            </div>
            <input
              type="text"
              placeholder="https://example.com/car-image.jpg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlInput((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="button"
              onClick={(e) => {
                const input = (e.target as HTMLElement)
                  .closest('.flex')
                  ?.querySelector('input');
                if (input) {
                  handleUrlInput(input.value);
                  input.value = '';
                }
              }}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </>
      )}

      {/* Helper Text */}
      <p className="text-xs text-neutral-500">
        <strong>Tip:</strong> Drag images to reorder. The first image will always be
        the primary image shown in listings.
      </p>
    </div>
  );
};

export default MultiImageUpload;
