// resources/js/pages/cottages/show-cottage-modal.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Users, DollarSign, Hash, Calendar, Sun, Moon, Image as ImageIcon } from 'lucide-react';
import { CottageData } from '@/types';
import { useState } from 'react';

interface ShowCottageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cottage: CottageData;
}

export default function ShowCottageModal({
    open,
    onOpenChange,
    cottage
}: ShowCottageModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Cottage Details
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 space-y-6 pr-2">
                        {/* Cottage Images */}
                        {cottage.images && cottage.images.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Cottage Images
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cottage.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative group cursor-pointer"
                                            onClick={() => setSelectedImage(`/storage/${image}`)}
                                        >
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`${cottage.name} ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Cottage Name</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Home className="w-4 h-4 text-gray-500" />
                                    <span>{cottage.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Cottage Size</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Badge variant={cottage.size === 'big' ? 'default' : 'secondary'}>
                                        {cottage.size_label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {cottage.description && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{cottage.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Capacity & Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Maximum Pax</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>{cottage.max_pax} persons</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Available Quantity</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    <span>{cottage.quantity} cottages</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Day Tour Price</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Sun className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">₱{cottage.formatted_day_tour_price}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Overnight Price</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Moon className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">₱{cottage.formatted_overnight_price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Badge variant={cottage.is_active ? 'default' : 'secondary'}>
                                    {cottage.status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Created At</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{cottage.created_at}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{cottage.updated_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl">
                        <img
                            src={selectedImage}
                            alt="Cottage preview"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
