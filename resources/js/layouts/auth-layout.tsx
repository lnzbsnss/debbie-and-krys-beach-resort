import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { Head } from '@inertiajs/react';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <>
            <Head>
                <script
                    src={`https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY}`}
                    defer
                />
            </Head>

            <AuthLayoutTemplate title={title} description={description} {...props}>
                {children}
            </AuthLayoutTemplate>
        </>
    );
}
