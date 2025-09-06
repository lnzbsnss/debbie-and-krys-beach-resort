import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleIndexProps, Role, DataTableColumn } from '@/types';
import DataTable from '@/components/datatable/datatable';
import CreateRoleModal from './create-role-modal';
import EditRoleModal from './edit-role-modal';
import DeleteRoleModal from './delete-role-modal';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function Index({ roles, permissions, filterOptions, queryParams, ...props }: RoleIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    useEffect(() => {
        const message = props.flash?.success || props.flash?.error;
        if (message) {
            if (props.flash?.success) {
                toast.success(message);
            } else {
                toast.error(message);
            }
        }
    }, [props.flash]);

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setEditModalOpen(true);
    };

    const handleDelete = (role: Role) => {
        setSelectedRole(role);
        setDeleteModalOpen(true);
    };

    const canCreateRole = props.auth.user.permissions?.includes('role create') || props.auth.user.permissions?.includes('global access');
    const canEditRole = props.auth.user.permissions?.includes('role edit') || props.auth.user.permissions?.includes('global access');
    const canDeleteRole = props.auth.user.permissions?.includes('role delete') || props.auth.user.permissions?.includes('global access');

    const columns: DataTableColumn[] = [
        {
            key: 'display_name',
            label: 'Role Name',
            sortable: true,
            searchable: true,
            filterable: true,
            width: '200px',
        },
        {
            key: 'permissions_display',
            label: 'Permissions',
            sortable: false,
            searchable: true,
            filterable: false,
            className: 'max-w-md',
        },
        {
            key: 'users_count_text',
            label: 'Users',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '150px',
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
        {
            key: 'updated_at',
            label: 'Updated',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        }
    ];

    const transformedRoles = {
        ...roles,
        data: roles.data.map(role => ({
            ...role,
            permissions_display: (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                        </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                        </Badge>
                    )}
                    {role.permissions.length === 0 && (
                        <span className="text-gray-400 text-sm">No permissions</span>
                    )}
                </div>
            ),
        }))
    };

    const createButton = canCreateRole ? (
        <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
        </Button>
    ) : null;

    return (
        <AppLayout>
            <Head title="Roles" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <DataTable
                        data={transformedRoles}
                        columns={columns}
                        filterOptions={filterOptions}
                        queryParams={queryParams}
                        title="Roles Management"
                        createButton={createButton}
                        exportFileName="roles"
                    >
                        {(role: Role) => (
                            <div className="flex items-center justify-end gap-2">
                                {canEditRole && role.can_edit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(role)}
                                        title="Edit role"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canDeleteRole && role.can_delete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(role)}
                                        title="Delete role"
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                {(!role.can_edit && !role.can_delete) && (
                                    <Badge variant="secondary" className="text-xs">
                                        Protected
                                    </Badge>
                                )}
                            </div>
                        )}
                    </DataTable>
                </div>
            </div>

            <CreateRoleModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                permissions={permissions}
            />

            {selectedRole && (
                <>
                    <EditRoleModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        role={selectedRole}
                        permissions={permissions}
                    />
                    <DeleteRoleModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        role={selectedRole}
                    />
                </>
            )}
        </AppLayout>
    );
}
