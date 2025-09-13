import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    ChevronUp,
    ChevronDown,
    Search,
    Filter,
    Download,
    RotateCcw,
    Eye,
    EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTableColumn, DataTableState, PaginatedData, FilterOptions } from '@/types';
import DataTablePagination from './datatable-pagination';
import DataTableExport from './datatable-export';
import DataTableColumnFilter from './datatable-column-filter';

interface DataTableProps<T> {
    data: PaginatedData<T>;
    columns: DataTableColumn[];
    filterOptions?: FilterOptions;
    queryParams?: Partial<DataTableState>;
    onRowAction?: (action: string, row: T) => void;
    children?: (row: T) => React.ReactNode;
    title?: string;
    createButton?: React.ReactNode;
    exportFileName?: string;
    rawData?: Record<string, any>[];
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    filterOptions = {},
    queryParams = {},
    onRowAction,
    children,
    title,
    createButton,
    exportFileName = 'export',
    rawData
}: DataTableProps<T>) {
    const [state, setState] = useState<DataTableState>({
        search: queryParams.search || '',
        sort: queryParams.sort || '',
        direction: queryParams.direction || 'asc',
        perPage: queryParams.perPage || 10,
        page: queryParams.page || 1,
        filters: queryParams.filters || {},
        columnVisibility: columns.reduce((acc, col) => ({
            ...acc,
            [col.key]: true
        }), {} as Record<string, boolean>)
    });

    const [searchInput, setSearchInput] = useState(state.search);
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== state.search) {
                updateState({ search: searchInput, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const updateState = (updates: Partial<DataTableState>) => {
        const newState = { ...state, ...updates };
        setState(newState);

        // Update URL with new state using Inertia router
        const queryParams: Record<string, any> = {};

        if (newState.search) queryParams.search = newState.search;
        if (newState.sort && typeof newState.sort === 'string') queryParams.sort = newState.sort; // Ensure it's a string
        if (newState.direction !== 'asc') queryParams.direction = newState.direction;
        if (newState.perPage !== 10) queryParams.per_page = newState.perPage;
        if (newState.page !== 1) queryParams.page = newState.page;

        // Add filters to query params
        if (Object.keys(newState.filters).length > 0) {
            Object.entries(newState.filters).forEach(([key, values]) => {
                if (values.length > 0) {
                    queryParams[`filters[${key}]`] = values;
                }
            });
        }

        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (column: string) => {
        // Ensure we're working with a string, not a function
        const sortColumn = typeof column === 'string' ? column : '';
        const newDirection = state.sort === sortColumn && state.direction === 'asc' ? 'desc' : 'asc';
        updateState({ sort: sortColumn, direction: newDirection, page: 1 });
    };

    const handleFilterChange = (column: string, values: string[]) => {
        updateState({
            filters: { ...state.filters, [column]: values },
            page: 1
        });
    };

    const resetFilters = () => {
        setSearchInput('');
        setState({
            search: '',
            sort: '',
            direction: 'asc',
            perPage: 10,
            page: 1,
            filters: {},
            columnVisibility: columns.reduce((acc, col) => ({
                ...acc,
                [col.key]: true
            }), {} as Record<string, boolean>)
        });

        router.get(window.location.pathname, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleColumnVisibility = (columnKey: string) => {
        setState(prev => ({
            ...prev,
            columnVisibility: {
                ...prev.columnVisibility,
                [columnKey]: !prev.columnVisibility[columnKey]
            }
        }));
    };

    const visibleColumns = useMemo(() =>
        columns.filter(col => state.columnVisibility[col.key]),
        [columns, state.columnVisibility]
    );

    const hasActiveFilters = useMemo(() =>
        state.search ||
        Object.values(state.filters).some(values => values.length > 0),
        [state.search, state.filters]
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                    {title && <h2 className="text-xl font-semibold">{title}</h2>}
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="gap-1">
                            Filtered
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={resetFilters}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {createButton}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-blue-50' : ''}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Column Visibility */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {columns.map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.key}
                                        checked={state.columnVisibility[column.key]}
                                        onCheckedChange={() => toggleColumnVisibility(column.key)}
                                    >
                                        {column.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Export */}
                        <DataTableExport
                            data={data.data}
                            columns={visibleColumns}
                            fileName={exportFileName}
                            rawData={rawData}
                        />

                        {/* Per Page */}
                        <Select
                            value={state.perPage.toString()}
                            onValueChange={(value) => updateState({ perPage: parseInt(value), page: 1 })}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Column Filters */}
                {showFilters && (
                    <DataTableColumnFilter
                        columns={columns.filter(col => col.filterable)}
                        filterOptions={filterOptions}
                        filters={state.filters}
                        onFilterChange={handleFilterChange}
                    />
                )}

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={`${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                        style={{ width: column.width }}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.label}
                                            {column.sortable && (
                                                <div className="flex flex-col">
                                                    <ChevronUp
                                                        className={`w-3 h-3 ${
                                                            state.sort === column.key && state.direction === 'asc'
                                                                ? 'text-blue-600'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                    <ChevronDown
                                                        className={`w-3 h-3 -mt-1 ${
                                                            state.sort === column.key && state.direction === 'desc'
                                                                ? 'text-blue-600'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                                {children && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumns.length + (children ? 1 : 0)}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((row, index) => (
                                    <TableRow key={row.id || index}>
                                        {visibleColumns.map((column) => (
                                            <TableCell key={column.key} className={column.className}>
                                                {row[column.key]}
                                            </TableCell>
                                        ))}
                                        {children && (
                                            <TableCell className="text-right">
                                                {children(row)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <DataTablePagination
                    data={data}
                    currentPage={state.page}
                    onPageChange={(page) => updateState({ page })}
                />

                {/* Info */}
                <div className="text-sm text-gray-500">
                    Showing {data.from || 0} to {data.to || 0} of {data.total} entries
                </div>
            </CardContent>
        </Card>
    );
}
