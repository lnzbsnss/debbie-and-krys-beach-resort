import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginatedData } from '@/types';

interface DataTablePaginationProps {
    data: PaginatedData<any>;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function DataTablePagination({
    data,
    currentPage,
    onPageChange
}: DataTablePaginationProps) {
    const { current_page, last_page, total } = data;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5; // Number of page buttons to show

        if (last_page <= showPages) {
            // Show all pages if total pages is small
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            // Show pages with ellipsis
            if (current_page <= 3) {
                // Near beginning
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(last_page);
            } else if (current_page >= last_page - 2) {
                // Near end
                pages.push(1);
                pages.push('...');
                for (let i = last_page - 3; i <= last_page; i++) {
                    pages.push(i);
                }
            } else {
                // In middle
                pages.push(1);
                pages.push('...');
                for (let i = current_page - 1; i <= current_page + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(last_page);
            }
        }

        return pages;
    };

    if (last_page <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={current_page === 1}
                    className="hidden sm:flex"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
            </div>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={index} className="px-3 py-1 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={current_page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className="w-9 h-9"
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(last_page)}
                    disabled={current_page === last_page}
                    className="hidden sm:flex"
                >
                    <ChevronsRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
