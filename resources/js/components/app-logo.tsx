// js\components\app-logo.tsx

import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <>
            <div className="flex items-center justify-center rounded-md">
                <AppLogoIcon className="h-12 w-auto rounded-md" />
            </div>

            {!isCollapsed && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <div className="mb-0.5 leading-tight font-semibold">
                        <div className="truncate">Debbie & Krys</div>
                        <div className="truncate">Beach Resort</div>
                    </div>
                </div>
            )}
        </>
    );
}
