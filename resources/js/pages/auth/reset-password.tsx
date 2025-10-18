import { useState } from 'react';
import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setShowPasswordRequirements(value.length > 0);
    };

    const { isValid: isPasswordValid } = validatePassword(password);
    const isPasswordMatch = password === passwordConfirmation;

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <Form
                {...NewPasswordController.store.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                            <PasswordRequirements
                                password={password}
                                show={showPasswordRequirements}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                placeholder="Confirm password"
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                            {passwordConfirmation && !isPasswordMatch && (
                                <p className="text-sm text-red-600">Passwords do not match</p>
                            )}
                            {passwordConfirmation && isPasswordMatch && password && (
                                <p className="text-sm text-green-600">Passwords match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={
                                processing ||
                                !isPasswordValid ||
                                !isPasswordMatch ||
                                !password ||
                                !passwordConfirmation
                            }
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
