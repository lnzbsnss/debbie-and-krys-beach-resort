import { useCallback, useEffect } from 'react';

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export const useRecaptcha = () => {
    const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.grecaptcha) {
                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
                        .then((token: string) => {
                            resolve(token);
                        })
                        .catch(() => {
                            resolve(null);
                        });
                });
            } else {
                resolve(null);
            }
        });
    }, []);

    const loadRecaptcha = useCallback(() => {
        if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) return;

        const existingScript = document.getElementById('recaptcha-script');
        if (existingScript) return;

        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        loadRecaptcha();
    }, [loadRecaptcha]);

    return { executeRecaptcha };
};
