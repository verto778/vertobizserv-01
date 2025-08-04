
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CandidateSearch from '@/components/candidates/CandidateSearch';

interface ClientHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
}

export const ClientHeader = ({ searchTerm, setSearchTerm, onAddClick }: ClientHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold">Client Management</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <CandidateSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Search clients..."
        />
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>
    </div>
  );
};
