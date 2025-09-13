import { useCallback, useEffect } from 'react';

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export const useRecaptcha = () => {
    const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
                resolve(null);
                return;
            }

            if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.ready) {
                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
                        .then((token: string) => {
                            resolve(token);
                        })
                        .catch((error: any) => {
                            console.error('reCAPTCHA execution failed:', error);
                            reject(error);
                        });
                });
            } else {
                console.error('reCAPTCHA not loaded or not ready');
                reject(new Error('reCAPTCHA not available'));
            }
        });
    }, []);

    const loadRecaptcha = useCallback(() => {
        if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
            console.warn('VITE_RECAPTCHA_SITE_KEY not set in environment variables');
            return;
        }

        const existingScript = document.getElementById('recaptcha-script');
        if (existingScript) return;

        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log('reCAPTCHA script loaded successfully');
        };

        script.onerror = (error) => {
            console.error('Failed to load reCAPTCHA script:', error);
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        loadRecaptcha();
    }, [loadRecaptcha]);

    return { executeRecaptcha, loadRecaptcha };
};
