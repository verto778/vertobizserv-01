import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ManagerList } from '@/components/managers/ManagerList';
import { AddManagerDialog } from '@/components/managers/AddManagerDialog';
import { useManagerManagement } from '@/hooks/useManagerManagement';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CandidateSearch from '@/components/candidates/CandidateSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ManagerManagement = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortingEnabled, setSortingEnabled] = useState(true);
  
  const { 
    managers, 
    loading, 
    handleAddManager, 
    handleEditManager, 
    handleDeleteManager, 
    handleToggleStatus 
  } = useManagerManagement();

  // Filter and sort managers
  const filteredAndSortedManagers = useMemo(() => {
    let filtered = managers.filter(manager => {
      const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && manager.isActive) ||
                        (activeTab === 'inactive' && !manager.isActive);
      return matchesSearch && matchesTab;
    });

    if (sortingEnabled) {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [managers, searchTerm, activeTab, sortingEnabled]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedManagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedManagers = filteredAndSortedManagers.slice(startIndex, endIndex);

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationItem key="start-ellipsis">...</PaginationItem>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationItem key="end-ellipsis">...</PaginationItem>);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Reset current page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manager Management</h1>
            <p className="text-muted-foreground">
              Manage your organization's managers and their status.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manager
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <CandidateSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Search managers by name..."
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({managers.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({managers.filter(m => m.isActive).length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({managers.filter(m => !m.isActive).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sorting"
                  checked={sortingEnabled}
                  onCheckedChange={(checked) => setSortingEnabled(checked === true)}
                />
                <label htmlFor="sorting" className="text-sm font-medium">
                  Sort by name
                </label>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Showing {Math.min(startIndex + 1, filteredAndSortedManagers.length)}-{Math.min(endIndex, filteredAndSortedManagers.length)} of {filteredAndSortedManagers.length} managers
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manager List */}
            {loading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading managers...</p>
              </div>
            ) : (
              <ManagerList
                managers={paginatedManagers}
                onEdit={handleEditManager}
                onDelete={handleDeleteManager}
                onToggleStatus={handleToggleStatus}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Manager Dialog */}
      <AddManagerDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleAddManager}
      />
    </DashboardLayout>
  );
};

export default ManagerManagement;