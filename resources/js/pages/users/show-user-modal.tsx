import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, User, Mail, Calendar, Shield as ShieldIcon } from 'lucide-react';
import { UserData } from '@/types';

interface ShowUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserData;
}

export default function ShowUserModal({
    open,
    onOpenChange,
    user
}: ShowUserModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        User Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <User className="w-4 h-4 text-gray-500" />
                                <span>{user.name}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="break-all text-sm">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Status</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Badge
                                    variant={user.status === 'active' ? 'default' : 'secondary'}
                                >
                                    {user.status_label}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Verification</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                {user.email_verified_at ? (
                                    <>
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Verified</span>
                                        <span className="text-xs text-gray-500">
                                            ({new Date(user.email_verified_at).toLocaleDateString()})
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500">Unverified</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <ShieldIcon className="w-4 h-4" />
                            Assigned Roles
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant={role === 'admin' ? 'destructive' : 'secondary'}
                                        >
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-500 text-sm">No roles assigned</span>
                            )}
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Created</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{user.created_at}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{user.updated_at}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    {user.is_admin && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-800">Administrator Account</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                                This user has administrative privileges and access to all system functions.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
