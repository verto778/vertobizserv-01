import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PositionList } from '@/components/positions/PositionList';
import { AddPositionDialog } from '@/components/positions/AddPositionDialog';
import { usePositionManagement } from '@/hooks/usePositionManagement';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import CandidateSearch from '@/components/candidates/CandidateSearch';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';

const PositionManagement = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortingEnabled, setSortingEnabled] = useState(false);
  
  const { 
    positions, 
    isLoading,
    handleAddPosition, 
    handleEditPosition, 
    handleDeletePosition, 
    handleToggleStatus 
  } = usePositionManagement();

  // Filter and conditionally sort positions BEFORE pagination
  const filteredAndSortedPositions = useMemo(() => {
    const filtered = positions.filter(position => {
      const matchesSearch = searchTerm === '' || 
        position.name.toLowerCase().startsWith(searchTerm.toLowerCase()) || 
        position.clientName.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (activeTab === 'active') return matchesSearch && position.isActive;
      if (activeTab === 'inactive') return matchesSearch && !position.isActive;
      return matchesSearch;
    });

    // Only sort if sorting is enabled
    if (sortingEnabled) {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
  }, [positions, searchTerm, activeTab, sortingEnabled]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPositions = filteredAndSortedPositions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Position Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-80">
              <CandidateSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                placeholder="Search positions or clients..."
              />
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-background border">
                  <TabsTrigger value="all" className="flex-1">All Positions</TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="inactive" className="flex-1">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="enable-sorting"
                  checked={sortingEnabled}
                  onCheckedChange={(checked) => setSortingEnabled(checked === true)}
                />
                <label htmlFor="enable-sorting" className="text-sm font-medium cursor-pointer">
                  Enable Sorting
                </label>
              </div>
            </div>
          </div>

          {/* Results summary and items per page */}
          <div className="flex justify-between items-center px-6 py-3 border-b bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPositions.length)} of {filteredAndSortedPositions.length} positions
              {sortingEnabled && <span className="ml-2 text-blue-600">(sorted by name)</span>}
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

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2 text-gray-500">Loading positions...</p>
            </div>
          ) : (
            <>
              <PositionList
                positions={paginatedPositions}
                onEdit={handleEditPosition}
                onDelete={handleDeletePosition}
                onToggleStatus={handleToggleStatus}
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
            </>
          )}
        </div>

        <AddPositionDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleAddPosition}
        />
      </div>
    </DashboardLayout>
  );
};

export default PositionManagement;
