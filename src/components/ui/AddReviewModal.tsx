import { type FC, type ChangeEvent, useState } from 'react';
import { Upload, Star } from 'lucide-react';
import { Modal, Button, Input } from '@components/ui';
import { supabase } from '@services/supabase';

interface AddReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddReviewModal: FC<AddReviewModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        comment: '',
        reviewUrl: '',
        photo: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, photo: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let photoUrl = null;

            // 1. Upload photo if exists
            if (formData.photo) {
                const fileExt = formData.photo.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('review-photos')
                    .upload(filePath, formData.photo);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('review-photos')
                    .getPublicUrl(filePath);

                photoUrl = data.publicUrl;
            }

            // 2. Insert review
            const { error: insertError } = await supabase
                .from('reviews')
                .insert({
                    name: formData.name,
                    rating: formData.rating,
                    comment: formData.comment,
                    review_url: formData.reviewUrl || null,
                    photo_url: photoUrl,
                    is_verified: true, // Auto-verify admin added reviews
                });

            if (insertError) throw insertError;

            onSuccess();
            onClose();
            // Reset form
            setFormData({ name: '', rating: 5, comment: '', reviewUrl: '', photo: null });
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error adding review:', error);
            alert('Failed to add review. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-2">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-full border border-neutral-200"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200 text-neutral-400">
                                <Upload className="w-8 h-8" />
                            </div>
                        )}
                        <label
                            htmlFor="photo-upload"
                            className="absolute bottom-0 right-0 bg-white border border-neutral-200 shadow-sm p-1.5 rounded-full cursor-pointer hover:bg-neutral-50"
                        >
                            <Upload className="w-3 h-3 text-neutral-600" />
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    <p className="text-xs text-neutral-500">Upload photo (Optional)</p>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Customer Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        required
                    />

                    <Input
                        label="Review Link (Optional)"
                        value={formData.reviewUrl}
                        onChange={(e) => setFormData({ ...formData, reviewUrl: e.target.value })}
                        placeholder="https://google.com/maps/..."
                        type="url"
                    />

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`p-1 rounded-full transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-neutral-300'
                                        }`}
                                >
                                    <Star className="w-6 h-6 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Review Message
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 min-h-[100px]"
                            placeholder="Write the customer's feedback here..."
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Submit Review
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
