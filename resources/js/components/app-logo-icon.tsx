// js\components\app-logo-icon.tsx

import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/dk-logo.png"
            alt="Debbie & Krys Beach Resort"
            className={`object-contain ${props.className || ''}`}
        />
    );
}
