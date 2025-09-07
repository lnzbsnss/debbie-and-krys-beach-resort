import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Calendar, Key } from 'lucide-react';
import { Role } from '@/types';

interface ShowRoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
}

export default function ShowRoleModal({
    open,
    onOpenChange,
    role
}: ShowRoleModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Role Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Role Name</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{role.display_name}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Users Count</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>{role.users_count_text}</span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Assigned Permissions ({role.permissions_count})
                        </label>
                        <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                            {role.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission) => (
                                        <Badge key={permission} variant="secondary" className="text-xs">
                                            {permission}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-500 text-sm">No permissions assigned</span>
                            )}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Created</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{role.created_at}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{role.updated_at}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Role Warning */}
                    {role.name === 'admin' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-800">Protected Role</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                                This is a system administrator role and cannot be modified or deleted.
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
