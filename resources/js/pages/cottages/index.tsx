// resources/js/pages/cottages/index.tsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Home } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/datatable/datatable';
import CreateCottageModal from './create-cottage-modal';
import ShowCottageModal from './show-cottage-modal';
import EditCottageModal from './edit-cottage-modal';
import DeleteCottageModal from './delete-cottage-modal';

import { type CottageIndexProps, type CottageData, type DataTableColumn, type BreadcrumbItem } from '@/types';

export default function Index({ cottages, filterOptions, queryParams, ...props }: CottageIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [showModalOpen, setShowModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCottage, setSelectedCottage] = useState<CottageData | null>(null);

    const handleShow = (cottage: CottageData) => {
        setSelectedCottage(cottage);
        setShowModalOpen(true);
    };

    const handleEdit = (cottage: CottageData) => {
        setSelectedCottage(cottage);
        setEditModalOpen(true);
    };

    const handleDelete = (cottage: CottageData) => {
        setSelectedCottage(cottage);
        setDeleteModalOpen(true);
    };

    const canCreateCottage = props.auth.user?.permissions?.includes('cottage access') || props.auth.user?.permissions?.includes('global access');
    const canShowCottage = props.auth.user?.permissions?.includes('cottage access') || props.auth.user?.permissions?.includes('global access');
    const canEditCottage = props.auth.user?.permissions?.includes('cottage access') || props.auth.user?.permissions?.includes('global access');
    const canDeleteCottage = props.auth.user?.permissions?.includes('cottage access') || props.auth.user?.permissions?.includes('global access');

    const columns: DataTableColumn[] = [
        {
            key: 'name',
            label: 'Cottage Name',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '200px',
        },
        {
            key: 'size_display',
            label: 'Size',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '120px',
        },
        {
            key: 'max_pax',
            label: 'Max Pax',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '100px',
        },
        {
            key: 'day_tour_price_display',
            label: 'Day Tour Price',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '140px',
        },
        {
            key: 'overnight_price_display',
            label: 'Overnight Price',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '140px',
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '100px',
        },
        {
            key: 'status_display',
            label: 'Status',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '120px',
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
    ];

    const transformedCottages = {
        ...cottages,
        data: cottages.data.map(cottage => ({
            ...cottage,
            size_display: (
                <Badge variant={cottage.size === 'big' ? 'default' : 'secondary'}>
                    {cottage.size_label}
                </Badge>
            ),
            day_tour_price_display: (
                <span className="font-medium">₱{cottage.formatted_day_tour_price}</span>
            ),
            overnight_price_display: (
                <span className="font-medium">₱{cottage.formatted_overnight_price}</span>
            ),
            status_display: (
                <Badge variant={cottage.is_active ? 'default' : 'secondary'}>
                    {cottage.status_label}
                </Badge>
            ),
        }))
    };

    const createButton = canCreateCottage ? (
        <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Cottage
        </Button>
    ) : null;

    const rawCottagesData = cottages.data.map(cottage => ({
        name: cottage.name,
        size: cottage.size_label,
        max_pax: cottage.max_pax,
        day_tour_price: cottage.formatted_day_tour_price,
        overnight_price: cottage.formatted_overnight_price,
        quantity: cottage.quantity,
        status: cottage.status_label,
        created_at: cottage.created_at,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Cottages',
            href: '/cottages',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cottages" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <DataTable
                        data={transformedCottages}
                        columns={columns}
                        filterOptions={filterOptions}
                        queryParams={queryParams}
                        title="Cottages Management"
                        createButton={createButton}
                        exportFileName="cottages"
                        rawData={rawCottagesData}
                    >
                        {(cottage: CottageData) => (
                            <div className="flex items-center justify-end gap-2">
                                {canShowCottage && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShow(cottage)}
                                        title="View cottage details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {canEditCottage && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(cottage)}
                                        title="Edit cottage"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canDeleteCottage && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(cottage)}
                                        title="Delete cottage"
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </DataTable>
                </div>
            </div>

            <CreateCottageModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {selectedCottage && (
                <>
                    <ShowCottageModal
                        open={showModalOpen}
                        onOpenChange={setShowModalOpen}
                        cottage={selectedCottage}
                    />
                    <EditCottageModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        cottage={selectedCottage}
                    />
                    <DeleteCottageModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        cottage={selectedCottage}
                    />
                </>
            )}
        </AppLayout>
    );
}
