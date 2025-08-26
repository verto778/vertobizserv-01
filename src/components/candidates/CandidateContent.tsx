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
  
  // Table-level sorting state (independent of header sorting)
  const [tableSortField, setTableSortField] = useState<keyof Candidate | null>(null);
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc' | null>(null);
  
  const {
    filters,
    filteredCandidates,
    isFilterPanelOpen,
    handleFilterChange,
    handleDateFilterChange,
    clearFilters,
    toggleFilterPanel
  } = useCandidateFilters(candidates);

  // Custom sorting order for statuses
  const getStatusOrder = (status: string, isStatus1: boolean = true) => {
    if (isStatus1) {
      const status1Order = ['Attended', 'Confirmed', 'Yet to Confirm', 'Client Conf Pending', 'Reschedule', 'Position Hold', 'Not Attended', 'Not Interested'];
      const index = status1Order.indexOf(status);
      return index !== -1 ? index : 999;
    } else {
      const status2Order = ['Selected', 'Shortlisted', 'Documentation', 'Feedback Awaited', 'Hold', 'Interview Reject', 'Final Reject', 'Drop'];
      const index = status2Order.indexOf(status);
      return index !== -1 ? index : 999;
    }
  };

  // Handle table column sorting
  const handleTableSort = (field: keyof Candidate, direction: 'asc' | 'desc' | 'clear') => {
    if (direction === 'clear') {
      setTableSortField(null);
      setTableSortDirection(null);
    } else {
      setTableSortField(field);
      setTableSortDirection(direction);
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Apply sorting based on sortOrder prop from header AND table column sorting
  const sortedCandidates = useMemo(() => {
    let candidates = [...filteredCandidates];
    
    // Apply table column sorting first (higher priority)
    if (tableSortField && tableSortDirection) {
      candidates = candidates.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        let aHasValue = true;
        let bHasValue = true;

        if (tableSortField === 'status1') {
          aValue = getStatusOrder(a.status1, true);
          bValue = getStatusOrder(b.status1, true);
        } else if (tableSortField === 'status2') {
          aValue = getStatusOrder(a.status2, false);
          bValue = getStatusOrder(b.status2, false);
        } else if (tableSortField === 'interviewDate') {
          aValue = a.interviewDate;
          bValue = b.interviewDate;
          
          // Special handling for interview dates - null dates always at bottom
          aHasValue = aValue !== null && aValue !== undefined;
          bHasValue = bValue !== null && bValue !== undefined;
          
          if (!aHasValue && !bHasValue) return 0;
          if (!aHasValue) return 1; // Null dates to bottom
          if (!bHasValue) return -1; // Valid dates to top
          
          // Convert to timestamps for proper date comparison
          const aTime = new Date(aValue).getTime();
          const bTime = new Date(bValue).getTime();
          
          return tableSortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        } else {
          aValue = a[tableSortField];
          bValue = b[tableSortField];
          
          // Check for null/undefined values
          aHasValue = aValue !== null && aValue !== undefined && aValue !== '';
          bHasValue = bValue !== null && bValue !== undefined && bValue !== '';
        }
        
        // Handle null/undefined values
        if (!aHasValue && !bHasValue) return 0;
        if (!aHasValue) return 1; // Put empty values at bottom
        if (!bHasValue) return -1; // Put valid values at top
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Normalize strings for proper alphabetical comparison
          const normalizedA = aValue.toLowerCase().trim();
          const normalizedB = bValue.toLowerCase().trim();
          return tableSortDirection === 'asc' 
            ? normalizedA.localeCompare(normalizedB, undefined, { sensitivity: 'accent', numeric: true })
            : normalizedB.localeCompare(normalizedA, undefined, { sensitivity: 'accent', numeric: true });
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return tableSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    // Apply header name sorting only if no table column sorting is active
    else if (sortOrder === 'asc') {
      candidates = candidates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      candidates = candidates.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return candidates;
  }, [filteredCandidates, sortOrder, tableSortField, tableSortDirection]);

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
              {tableSortField && tableSortDirection && (
                <span className="ml-2 text-blue-600">
                  (sorted by {tableSortField} {
                    tableSortField === 'interviewDate' 
                      ? (tableSortDirection === 'asc' ? 'Low to High' : 'High to Low')
                      : (tableSortDirection === 'asc' ? 'A-Z' : 'Z-A')
                  })
                </span>
              )}
              {!tableSortField && sortOrder !== 'none' && (
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
            onSort={handleTableSort}
            sortField={tableSortField}
            sortDirection={tableSortDirection}
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
