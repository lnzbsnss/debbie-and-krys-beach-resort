// resources/js/pages/users/lock-user-modal.tsx

import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen, Shield } from 'lucide-react';
import { UserData } from '@/types';
import users from '@/routes/users';

interface LockUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserData;
}

export default function LockUserModal({
    open,
    onOpenChange,
    user
}: LockUserModalProps) {
    const { post, processing } = useForm();

    const handleToggleLock = () => {
        const route = user.is_locked
            ? users.unlock.url(user.id)
            : users.lock.url(user.id);

        post(route, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const isLocking = !user.is_locked;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isLocking ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                            {isLocking ? (
                                <Lock className="w-5 h-5 text-red-600" />
                            ) : (
                                <LockOpen className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                        <div>
                            <DialogTitle>
                                {isLocking ? 'Lock User Account' : 'Unlock User Account'}
                            </DialogTitle>
                            <DialogDescription>
                                {isLocking
                                    ? `Are you sure you want to lock "${user?.name}"'s account? They will not be able to log in.`
                                    : `Are you sure you want to unlock "${user?.name}"'s account? They will be able to log in again.`
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {user?.is_admin && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium">Admin User Protection</p>
                            <p>Admin users cannot be locked for security reasons.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Status:</strong> {user?.status_label}</p>
                    <p><strong>Current State:</strong> {user?.is_locked ? 'Locked' : 'Unlocked'}</p>
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
                        variant={isLocking ? 'destructive' : 'default'}
                        onClick={handleToggleLock}
                        disabled={processing || user?.is_admin}
                    >
                        {processing ? 'Processing...' : (isLocking ? 'Lock Account' : 'Unlock Account')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
