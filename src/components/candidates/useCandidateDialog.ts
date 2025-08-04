
import { useState } from 'react';
import { Candidate } from '@/components/candidates/types';

export const useCandidateDialog = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>(undefined);
  
  const openAddDialog = () => {
    setEditingCandidate(undefined);
    setIsAddDialogOpen(true);
  };
  
  const openEditDialog = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsAddDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingCandidate(undefined);
  };
  
  return {
    isAddDialogOpen,
    editingCandidate,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setIsAddDialogOpen
  };
};
