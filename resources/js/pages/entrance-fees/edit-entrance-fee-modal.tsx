// resources/js/pages/entrance-fees/edit-entrance-fee-modal.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import { type EntranceFeeData, type EntranceFeeFormData } from '@/types';
import entranceFees from '@/routes/entrance-fees';
import { LoaderCircle } from 'lucide-react';

interface EditEntranceFeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entranceFee: EntranceFeeData;
}

export default function EditEntranceFeeModal({
    open,
    onOpenChange,
    entranceFee
}: EditEntranceFeeModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<EntranceFeeFormData>({
        name: '',
        type: '',
        price: 0,
        min_age: null,
        max_age: null,
        is_active: true,
    });

    useEffect(() => {
        if (open && entranceFee) {
            setData({
                name: entranceFee.name,
                type: entranceFee.type,
                price: entranceFee.price,
                min_age: entranceFee.min_age,
                max_age: entranceFee.max_age,
                is_active: entranceFee.is_active,
            });
        }
    }, [open, entranceFee]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(entranceFees.update.url(entranceFee.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const canSubmit = data.name && data.type && data.price >= 0 && !processing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Entrance Fee: {entranceFee?.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Fee Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Day Tour - Adult"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Fee Type</Label>
                        <Input
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            placeholder="e.g., day_tour_adult, overnight"
                            className={errors.type ? 'border-red-500' : ''}
                        />
                        {errors.type && (
                            <p className="text-sm text-red-500">{errors.type}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (₱)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value))}
                            className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && (
                            <p className="text-sm text-red-500">{errors.price}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_age">Minimum Age</Label>
                            <Input
                                id="min_age"
                                type="number"
                                min="0"
                                value={data.min_age ?? ''}
                                onChange={(e) => setData('min_age', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Optional"
                                className={errors.min_age ? 'border-red-500' : ''}
                            />
                            {errors.min_age && (
                                <p className="text-sm text-red-500">{errors.min_age}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="max_age">Maximum Age</Label>
                            <Input
                                id="max_age"
                                type="number"
                                min="0"
                                value={data.max_age ?? ''}
                                onChange={(e) => setData('max_age', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Optional"
                                className={errors.max_age ? 'border-red-500' : ''}
                            />
                            {errors.max_age && (
                                <p className="text-sm text-red-500">{errors.max_age}</p>
                            )}
                        </div>
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
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Update Entrance Fee
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
