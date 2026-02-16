import { type FC, useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Modal } from './Modal';
import { Button } from './Button';
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    RectangleHorizontal,
    Square,
    Smartphone,
    Check,
    X,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageCropModalProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
    fileName?: string;
}

interface AspectOption {
    label: string;
    value: number | undefined;
    icon: React.ReactNode;
}

// ─── Canvas Crop Helper ───────────────────────────────────────────────────────

const createCroppedImage = async (
    imageSrc: string,
    cropArea: Area,
    rotation: number = 0,
    flipH: boolean = false,
    flipV: boolean = false,
): Promise<Blob> => {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const radians = (rotation * Math.PI) / 180;

    // Calculate bounding box of rotated image
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const bBoxWidth = image.width * cos + image.height * sin;
    const bBoxHeight = image.width * sin + image.height * cos;

    // Set canvas to bounding box size
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate and rotate
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(radians);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    // Extract the cropped area
    const data = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            },
            'image/jpeg',
            0.92
        );
    });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.src = src;
    });
};

// ─── Aspect Ratio Options ─────────────────────────────────────────────────────

const aspectOptions: AspectOption[] = [
    { label: 'Free', value: undefined, icon: <Maximize2 size={14} /> },
    { label: '1:1', value: 1, icon: <Square size={14} /> },
    { label: '16:9', value: 16 / 9, icon: <RectangleHorizontal size={14} /> },
    { label: '4:3', value: 4 / 3, icon: <RectangleHorizontal size={14} /> },
    { label: '9:16', value: 9 / 16, icon: <Smartphone size={14} /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ImageCropModal: FC<ImageCropModalProps> = ({
    isOpen,
    imageSrc,
    onClose,
    onCropComplete,
    fileName,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [activeAspectIdx, setActiveAspectIdx] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleApply = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const blob = await createCroppedImage(imageSrc, croppedAreaPixels, rotation, flipH, flipV);
            onCropComplete(blob);
        } catch (error) {
            console.error('Crop failed:', error);
            alert('Failed to crop image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAspectChange = (idx: number) => {
        setActiveAspectIdx(idx);
        setAspect(aspectOptions[idx].value);
    };

    const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
    const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setActiveAspectIdx(0);
        setAspect(undefined);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Edit Image</h2>
                        {fileName && (
                            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[300px]">{fileName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="relative bg-neutral-900" style={{ height: '400px' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        rotation={rotation}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropAreaComplete}
                        showGrid
                        style={{
                            containerStyle: { borderRadius: 0 },
                            cropAreaStyle: {
                                border: '2px solid rgba(255,255,255,0.8)',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                            },
                        }}
                    />
                </div>

                {/* Controls Panel */}
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 space-y-4">
                    {/* Aspect Ratio Row */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 w-16 flex-shrink-0">
                            Ratio
                        </span>
                        <div className="flex items-center gap-1">
                            {aspectOptions.map((opt, idx) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleAspectChange(idx)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeAspectIdx === idx
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-red-300 hover:text-red-600'
                                        }`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zoom & Rotation Row */}
                    <div className="flex items-center gap-6">
                        {/* Zoom */}
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 w-16 flex-shrink-0">
                                Zoom
                            </span>
                            <div className="flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                                    className="p-1.5 rounded-lg hover:bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors"
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-red-600"
                                />
                                <button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                    className="p-1.5 rounded-lg hover:bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors"
                                >
                                    <ZoomIn size={14} />
                                </button>
                                <span className="text-xs text-neutral-400 min-w-[36px] text-right font-mono">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-8 bg-neutral-200"></div>

                        {/* Transform Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleRotateLeft}
                                className="p-1.5 rounded-lg hover:bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors"
                                title="Rotate left 90°"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button
                                onClick={handleRotateRight}
                                className="p-1.5 rounded-lg hover:bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors"
                                title="Rotate right 90°"
                            >
                                <RotateCw size={14} />
                            </button>
                            <button
                                onClick={() => setFlipH(!flipH)}
                                className={`p-1.5 rounded-lg border transition-colors ${flipH
                                        ? 'bg-red-50 border-red-200 text-red-600'
                                        : 'hover:bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700'
                                    }`}
                                title="Flip horizontal"
                            >
                                <FlipHorizontal size={14} />
                            </button>
                            <button
                                onClick={() => setFlipV(!flipV)}
                                className={`p-1.5 rounded-lg border transition-colors ${flipV
                                        ? 'bg-red-50 border-red-200 text-red-600'
                                        : 'hover:bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700'
                                    }`}
                                title="Flip vertical"
                            >
                                <FlipVertical size={14} />
                            </button>
                            <span className="text-xs text-neutral-400 ml-1 font-mono min-w-[32px]">
                                {rotation}°
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-white">
                    <button
                        onClick={handleReset}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors underline"
                    >
                        Reset all
                    </button>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose} className="gap-1.5">
                            <X size={14} />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            isLoading={isProcessing}
                            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                        >
                            <Check size={14} />
                            Apply & Insert
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ImageCropModal;
