import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield } from 'lucide-react';
import { UserData } from '@/types';
import users from '@/routes/users';

interface DeleteUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserData;
}

export default function DeleteUserModal({
    open,
    onOpenChange,
    user
}: DeleteUserModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(users.destroy.url(user.id), {
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
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the user "{user?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {user?.is_admin && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium">Admin User Protection</p>
                            <p>This user has admin privileges. Admin users cannot be deleted for security reasons.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Status:</strong> {user?.status_label}</p>
                    <p><strong>Roles:</strong> {user?.roles_text}</p>
                    <p><strong>Created:</strong> {user?.created_at}</p>
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
                        disabled={processing || user?.is_admin}
                    >
                        {processing ? 'Deleting...' : 'Delete User'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
