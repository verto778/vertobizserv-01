import React, { useState, useMemo } from 'react';
import CandidateTable from '@/components/candidates/CandidateTable';
import AdvancedFilterPanel from '@/components/candidates/AdvancedFilterPanel';
import { Candidate } from '@/components/candidates/types';
import { useCandidateFilters } from '@/hooks/useCandidateFilters';
import { usePositions } from '@/hooks/usePositions';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';

interface CandidateContentProps {
  loading: boolean;
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete?: (candidateId: string) => void;
  clients: Array<{ id: string; companyName: string; position?: string }>;
  positions: Array<{ id: string; name: string }>;
  sortOrder: 'asc' | 'desc' | 'none';
}

const CandidateContent: React.FC<CandidateContentProps> = ({ 
  loading, 
  candidates, 
  onEdit,
  onDelete,
  clients,
  positions,
  sortOrder
}) => {
  const { positions: allPositions } = usePositions(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const {
    filters,
    filteredCandidates,
    isFilterPanelOpen,
    handleFilterChange,
    handleDateFilterChange,
    clearFilters,
    toggleFilterPanel
  } = useCandidateFilters(candidates);

  // Apply sorting based on sortOrder prop from header
  const sortedCandidates = useMemo(() => {
    if (sortOrder === 'asc') {
      return [...filteredCandidates].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      return [...filteredCandidates].sort((a, b) => b.name.localeCompare(a.name));
    }
    return filteredCandidates;
  }, [filteredCandidates, sortOrder]);

  // Apply pagination to the sorted results 
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortedCandidates.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading candidates...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdvancedFilterPanel
        isOpen={isFilterPanelOpen}
        onToggle={toggleFilterPanel}
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateFilterChange={handleDateFilterChange}
        onClearFilters={clearFilters}
        clients={clients}
        positions={positions}
        candidates={candidates}
      />
      
      {sortedCandidates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {candidates.length === 0 
            ? "No candidates added yet. Add a candidate to get started."
            : "No candidates match the current filters. Try adjusting your filter criteria."
          }
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          {/* Results summary and items per page */}
          <div className="flex justify-between items-center px-6 py-3 border-b bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedCandidates.length)} of {sortedCandidates.length} candidates
              {sortOrder !== 'none' && (
                <span className="ml-2 text-blue-600">
                  (sorted by name {sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <CandidateTable 
            candidates={paginatedCandidates} 
            onEdit={onEdit} 
            onDelete={onDelete}
            positions={allPositions}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-6 py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateContent;
