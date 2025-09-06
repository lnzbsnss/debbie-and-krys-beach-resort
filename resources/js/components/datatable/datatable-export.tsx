import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumn } from '@/types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface DataTableExportProps<T> {
    data: T[];
    columns: DataTableColumn[];
    fileName: string;
}

export default function DataTableExport<T extends Record<string, any>>({
    data,
    columns,
    fileName
}: DataTableExportProps<T>) {

    const exportData = (format: 'csv' | 'excel') => {
        // Prepare data for export
        const exportData = data.map(row => {
            const exportRow: Record<string, any> = {};
            columns.forEach(column => {
                // Clean up the data for export (remove HTML, get plain text)
                let value = row[column.key];

                // Handle different data types
                if (typeof value === 'string') {
                    // Remove HTML tags if any
                    value = value.replace(/<[^>]*>/g, '');
                } else if (Array.isArray(value)) {
                    value = value.join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }

                exportRow[column.label] = value;
            });
            return exportRow;
        });

        if (format === 'csv') {
            exportToCSV(exportData, fileName);
        } else {
            exportToExcel(exportData, fileName);
        }
    };

    const exportToCSV = (data: Record<string, any>[], filename: string) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header]?.toString() || '';
                    // Escape commas and quotes in CSV
                    return value.includes(',') || value.includes('"')
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${filename}.csv`);
    };

    const exportToExcel = (data: Record<string, any>[], filename: string) => {
        if (data.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Auto-size columns
        const columnWidths = Object.keys(data[0]).map(key => {
            const maxLength = Math.max(
                key.length,
                ...data.map(row => (row[key]?.toString() || '').length)
            );
            return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
        });
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, `${filename}.xlsx`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportData('csv')}>
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('excel')}>
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
