import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Shield } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        requiredPermissions: [],
    },
    {
        title: 'User',
        href: '/users',
        icon: Users,
        requiredPermissions: ['user show', 'global access'],
    },
    {
        title: 'Role',
        href: '/roles',
        icon: Shield,
        requiredPermissions: ['role show', 'global access'],
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    // Filter navigation items based on user permissions
    const mainNavItems = useMemo(() => {
        return allNavItems.filter(item => {
            // If no permissions required, show the item
            if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
                return true;
            }

            // Check if user has any of the required permissions
            return item.requiredPermissions.some(permission =>
                auth.user.permissions?.includes(permission)
            );
        });
    }, [auth.user.permissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href='/dashboard' prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
