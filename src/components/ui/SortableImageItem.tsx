import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';

interface SortableImageProps {
    id: string;
    url: string;
    index: number;
    onRemove: (index: number) => void;
}

export const SortableImageItem = ({ id, url, index, onRemove }: SortableImageProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative aspect-video rounded-lg overflow-hidden group bg-neutral-100 border border-neutral-200 touch-none"
        >
            <img src={url} alt={`Header ${index + 1}`} className="w-full h-full object-cover" />

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-black/40 text-white rounded cursor-grab active:cursor-grabbing hover:bg-black/60 transition-colors"
                title="Drag to reorder"
            >
                <GripVertical size={14} />
            </div>

            {/* Remove Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(index);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove image"
            >
                <X size={12} />
            </button>

            {/* Index Badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {index === 0 ? 'Main Cover' : `#${index + 1}`}
            </div>

            {/* Main Cover Label Overlay (First Item Only) */}
            {index === 0 && (
                <div className="absolute inset-x-0 bottom-0 bg-green-500/80 text-white text-[10px] font-bold uppercase tracking-wider py-1 text-center backdrop-blur-sm">
                    Default Cover
                </div>
            )}
        </div>
    );
};
