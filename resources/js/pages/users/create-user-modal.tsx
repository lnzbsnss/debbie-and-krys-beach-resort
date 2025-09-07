import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { UserRole, UserFormData } from '@/types';
import { LoaderCircle } from 'lucide-react';

interface CreateUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableRoles: UserRole[];
}

export default function CreateUserModal({ open, onOpenChange, availableRoles }: CreateUserModalProps) {
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<UserFormData & { password_confirmation: string }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 'active',
        email_verified_at: false,
        roles: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password requirements
        const { isValid } = validatePassword(data.password);
        if (!isValid) {
            return;
        }

        // Check password confirmation
        if (data.password !== data.password_confirmation) {
            return;
        }

        post('/users', {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                setShowPasswordRequirements(false);
            },
        });
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        setData('roles', checked
            ? [...data.roles, roleName]
            : data.roles.filter(role => role !== roleName)
        );
    };

    const handlePasswordChange = (password: string) => {
        setData('password', password);
        setShowPasswordRequirements(password.length > 0);
    };

    const { isValid: isPasswordValid } = validatePassword(data.password);
    const isPasswordMatch = data.password === data.password_confirmation;
    const canSubmit = data.name && data.email && data.password && data.password_confirmation &&
                     isPasswordValid && isPasswordMatch && !processing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter full name"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter email address"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            value={data.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder="Enter password"
                            className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password}</p>
                        )}
                        <PasswordRequirements
                            password={data.password}
                            show={showPasswordRequirements}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                            className={errors.password_confirmation ? 'border-red-500' : ''}
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                        )}
                        {data.password_confirmation && !isPasswordMatch && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                        )}
                        {data.password_confirmation && isPasswordMatch && data.password && (
                            <p className="text-sm text-green-600">Passwords match</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-600">{errors.status}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="email_verified"
                            checked={data.email_verified_at}
                            onCheckedChange={(checked) => setData('email_verified_at', checked as boolean)}
                        />
                        <Label htmlFor="email_verified">Email verified</Label>
                    </div>

                    <div className="grid gap-2">
                        <Label>Roles</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {availableRoles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.name)}
                                        onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="text-sm">
                                        {role.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.roles && (
                            <p className="text-sm text-red-600">{errors.roles}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onOpenChange(false);
                                setShowPasswordRequirements(false);
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                        >
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Create User
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
