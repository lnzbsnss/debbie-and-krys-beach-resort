import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import FlashToastHandler from '@/components/flash-toast-handler';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <>
            <FlashToastHandler />
            <AuthLayoutTemplate title={title} description={description} {...props}>
                {children}
            </AuthLayoutTemplate>
        </>
    );
}
