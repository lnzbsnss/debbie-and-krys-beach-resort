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
import { Role } from '@/types';
import roles from '@/routes/roles';

interface DeleteRoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
}

export default function DeleteRoleModal({
    open,
    onOpenChange,
    role
}: DeleteRoleModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(roles.destroy.url(role.id), {
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
                            <DialogTitle>Delete Role</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the role "{role?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

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
                        {processing ? 'Deleting...' : 'Delete Role'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
