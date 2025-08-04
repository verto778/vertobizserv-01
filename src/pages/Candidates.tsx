
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CandidateHeader from '@/components/candidates/CandidateHeader';
import CandidateContent from '@/components/candidates/CandidateContent';
import { AddCandidateDialog } from '@/components/candidates/AddCandidateDialog';
import { useCandidateManagement } from '@/hooks/useCandidateManagement';
import { useClientList } from '@/hooks/useClientList';
import { usePositions } from '@/hooks/usePositions';
import { useCandidateDialog } from '@/components/candidates/useCandidateDialog';
import { initEmailJS } from '@/utils/emailService';

export const Candidates = () => {
  const { 
    candidates, 
    searchTerm, 
    setSearchTerm, 
    sortOrder, 
    setSortOrder, 
    loading, 
    handleAddCandidate,
    handleDeleteCandidate 
  } = useCandidateManagement();
  const { clients } = useClientList();
  const { positions } = usePositions();
  const { 
    isAddDialogOpen, 
    editingCandidate, 
    openAddDialog, 
    openEditDialog, 
    setIsAddDialogOpen 
  } = useCandidateDialog();

  // Initialize EmailJS when the component mounts
  useEffect(() => {
    initEmailJS();
    console.log("EmailJS initialized in Candidates component");
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <CandidateHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onAddClick={openAddDialog}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        <CandidateContent 
          loading={loading} 
          candidates={candidates} 
          onEdit={openEditDialog}
          onDelete={handleDeleteCandidate}
          clients={clients}
          positions={positions}
          sortOrder={sortOrder}
        />

        <AddCandidateDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddCandidate}
          editCandidate={editingCandidate}
          clients={clients}
        />
      </div>
    </DashboardLayout>
  );
};
