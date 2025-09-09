
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
    const { t } = useI18n();
    const pageNumbers = [];
    const maxPageButtons = 5;

    // Logic to create page numbers with ellipses
    if (totalPages <= maxPageButtons + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
            endPage = 4;
        }
        if (currentPage >= totalPages - 2) {
            startPage = totalPages - 3;
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }
    
    if (totalPages <= 1) return null;
    
    const fromItem = (currentPage - 1) * itemsPerPage + 1;
    const toItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-8" aria-label="Pagination">
        <div className="hidden sm:block">
             <p className="text-sm text-gray-700">
                {t('pagination.showing')} <span className="font-medium">{fromItem}</span> {t('pagination.to')} <span className="font-medium">{toItem}</span> {t('pagination.of')} <span className="font-medium">{totalItems}</span> {t('pagination.results')}
            </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
            <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
            {t('pagination.previous')}
            </button>
            <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
            {t('pagination.next')}
            </button>
      </div>
    </nav>
  );
};
