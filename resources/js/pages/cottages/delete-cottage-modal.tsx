// resources/js/pages/cottages/delete-cottage-modal.tsx
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CottageData } from '@/types';
import cottages from '@/routes/cottages';

interface DeleteCottageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cottage: CottageData;
}

export default function DeleteCottageModal({
    open,
    onOpenChange,
    cottage
}: DeleteCottageModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(cottages.destroy.url(cottage.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Cottage</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the cottage "{cottage?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {cottage?.name}</p>
                    <p><strong>Size:</strong> {cottage?.size_label}</p>
                    <p><strong>Max Pax:</strong> {cottage?.max_pax}</p>
                    <p><strong>Day Tour Price:</strong> ₱{cottage?.formatted_day_tour_price}</p>
                    <p><strong>Overnight Price:</strong> ₱{cottage?.formatted_overnight_price}</p>
                    <p><strong>Quantity:</strong> {cottage?.quantity}</p>
                    <p><strong>Status:</strong> {cottage?.status_label}</p>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Cottage'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
