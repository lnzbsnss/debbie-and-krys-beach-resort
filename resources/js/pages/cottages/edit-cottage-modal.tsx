// resources/js/pages/cottages/edit-cottage-modal.tsx
import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type CottageData, type CottageFormData } from '@/types';
import cottages from '@/routes/cottages';
import { LoaderCircle, Upload, X } from 'lucide-react';

interface EditCottageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cottage: CottageData;
}

export default function EditCottageModal({
    open,
    onOpenChange,
    cottage
}: EditCottageModalProps) {
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<any>({
        name: '',
        size: 'big',
        description: null,
        max_pax: 1,
        day_tour_price: 0,
        overnight_price: 0,
        quantity: 1,
        images: null,
        existing_images: [],
        is_active: true,
        _method: 'PUT',
    });

    useEffect(() => {
        if (open && cottage) {
            const cottageExistingImages = cottage.images || [];
            setExistingImages(cottageExistingImages);
            setNewImagePreviews([]);

            setData({
                name: cottage.name,
                size: cottage.size,
                description: cottage.description,
                max_pax: cottage.max_pax,
                day_tour_price: cottage.day_tour_price,
                overnight_price: cottage.overnight_price,
                quantity: cottage.quantity,
                images: null,
                existing_images: cottageExistingImages,
                is_active: cottage.is_active,
                _method: 'PUT',
            });
        }
    }, [open, cottage]);

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('images', files as any);

        // Create preview URLs for new images
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(previews);
    };

    const handleRemoveExistingImage = (index: number) => {
        const newExistingImages = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExistingImages);
        setData('existing_images', newExistingImages);
    };

    const handleRemoveNewImage = (index: number) => {
        const newImages = Array.from(data.images || []).filter((_, i) => i !== index);
        setData('images', newImages.length > 0 ? newImages as any : null);

        const newPreviews = newImagePreviews.filter((_, i) => i !== index);
        setNewImagePreviews(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(cottages.update.url(cottage.id), {
            onSuccess: () => {
                setNewImagePreviews([]);
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        setNewImagePreviews([]);
        onOpenChange(false);
    };

    const canSubmit = data.name && data.max_pax > 0 && data.day_tour_price >= 0 && data.overnight_price >= 0 && !processing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Cottage: {cottage?.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Cottage Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter cottage name"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="size">Cottage Size</Label>
                        <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                            <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="big">Big</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.size && (
                            <p className="text-sm text-red-500">{errors.size}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value || null)}
                            placeholder="Enter cottage description"
                            rows={3}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="max_pax">Max Pax</Label>
                            <Input
                                id="max_pax"
                                type="number"
                                min="1"
                                value={data.max_pax}
                                onChange={(e) => setData('max_pax', parseInt(e.target.value))}
                                className={errors.max_pax ? 'border-red-500' : ''}
                            />
                            {errors.max_pax && (
                                <p className="text-sm text-red-500">{errors.max_pax}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                className={errors.quantity ? 'border-red-500' : ''}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500">{errors.quantity}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="day_tour_price">Day Tour Price (₱)</Label>
                            <Input
                                id="day_tour_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.day_tour_price}
                                onChange={(e) => setData('day_tour_price', parseFloat(e.target.value))}
                                className={errors.day_tour_price ? 'border-red-500' : ''}
                            />
                            {errors.day_tour_price && (
                                <p className="text-sm text-red-500">{errors.day_tour_price}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="overnight_price">Overnight Price (₱)</Label>
                            <Input
                                id="overnight_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.overnight_price}
                                onChange={(e) => setData('overnight_price', parseFloat(e.target.value))}
                                className={errors.overnight_price ? 'border-red-500' : ''}
                            />
                            {errors.overnight_price && (
                                <p className="text-sm text-red-500">{errors.overnight_price}</p>
                            )}
                        </div>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="grid gap-2">
                            <Label>Current Images</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {existingImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={`/storage/${image}`}
                                            alt={`Cottage ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Image Upload */}
                    <div className="grid gap-2">
                        <Label htmlFor="images">Add New Images</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('images')?.click()}
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Images
                            </Button>
                            <input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleNewImageChange}
                                className="hidden"
                            />
                        </div>
                        {errors.images && (
                            <p className="text-sm text-red-600">{errors.images}</p>
                        )}

                        {/* New Image Previews */}
                        {newImagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {newImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`New ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                        />
                        <Label htmlFor="is_active" className="text-sm cursor-pointer">
                            Active Status
                        </Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Update Cottage
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
