import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DataTableColumn, FilterOptions } from '@/types';

interface DataTableColumnFilterProps {
    columns: DataTableColumn[];
    filterOptions: FilterOptions;
    filters: Record<string, string[]>;
    onFilterChange: (column: string, values: string[]) => void;
}

export default function DataTableColumnFilter({
    columns,
    filterOptions,
    filters,
    onFilterChange
}: DataTableColumnFilterProps) {
    const [searchFilters, setSearchFilters] = React.useState<Record<string, string>>({});

    const handleSearchFilterChange = (column: string, value: string) => {
        setSearchFilters(prev => ({ ...prev, [column]: value }));

        // Debounce the filter change
        const timer = setTimeout(() => {
            if (value.trim()) {
                onFilterChange(column, [value.trim()]);
            } else {
                onFilterChange(column, []);
            }
        }, 500);

        return () => clearTimeout(timer);
    };

    const handleCheckboxFilterChange = (column: string, value: string, checked: boolean) => {
        const currentValues = filters[column] || [];
        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter(v => v !== value);

        onFilterChange(column, newValues);
    };

    const clearColumnFilter = (column: string) => {
        onFilterChange(column, []);
        setSearchFilters(prev => ({ ...prev, [column]: '' }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {columns.map((column) => {
                const hasFilter = filters[column.key]?.length > 0 || searchFilters[column.key];
                const columnFilterOptions = filterOptions[column.key];

                return (
                    <div key={column.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{column.label}</Label>
                            {hasFilter && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearColumnFilter(column.key)}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>

                        {/* Search-based filter for searchable columns */}
                        {column.searchable && (
                            <Input
                                placeholder={`Search ${column.label.toLowerCase()}...`}
                                value={searchFilters[column.key] || ''}
                                onChange={(e) => handleSearchFilterChange(column.key, e.target.value)}
                                className="h-8"
                            />
                        )}

                        {/* Checkbox-based filter for columns with predefined options */}
                        {columnFilterOptions && Array.isArray(columnFilterOptions) && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        {filters[column.key]?.length > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs">
                                                    {filters[column.key].length} selected
                                                </span>
                                                {filters[column.key].slice(0, 2).map((value) => (
                                                    <Badge key={value} variant="secondary" className="text-xs">
                                                        {typeof columnFilterOptions[0] === 'object'
                                                            ? (columnFilterOptions as any[]).find(opt => opt.value === value)?.label || value
                                                            : value
                                                        }
                                                    </Badge>
                                                ))}
                                                {filters[column.key].length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{filters[column.key].length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            `Filter ${column.label.toLowerCase()}`
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-3" align="start">
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {(columnFilterOptions as any[]).map((option) => {
                                            const value = typeof option === 'object' ? option.value : option;
                                            const label = typeof option === 'object' ? option.label : option;
                                            const isChecked = filters[column.key]?.includes(value) || false;

                                            return (
                                                <div key={value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) =>
                                                            handleCheckboxFilterChange(column.key, value, checked as boolean)
                                                        }
                                                    />
                                                    <Label className="text-sm cursor-pointer flex-1">
                                                        {label}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Show active filters */}
                        {filters[column.key]?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {filters[column.key].slice(0, 3).map((value) => (
                                    <Badge
                                        key={value}
                                        variant="secondary"
                                        className="text-xs cursor-pointer"
                                        onClick={() => handleCheckboxFilterChange(column.key, value, false)}
                                    >
                                        {value}
                                        <X className="w-3 h-3 ml-1" />
                                    </Badge>
                                ))}
                                {filters[column.key].length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{filters[column.key].length - 3} more
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
