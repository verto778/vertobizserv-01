
import { useState, useMemo } from 'react';
import { Candidate } from '@/components/candidates/types';

export interface FilterState {
  mode: string;
  status1: string;
  status2: string;
  round: string;
  clientName: string;
  position: string;
  interviewDate: Date | null;
  manager: string;
}

const initialFilterState: FilterState = {
  mode: '',
  status1: '',
  status2: '',
  round: '',
  clientName: '',
  position: '',
  interviewDate: null,
  manager: ''
};

export const useCandidateFilters = (candidates: Candidate[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleDateFilterChange = (date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      interviewDate: date
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilterState);
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(prev => !prev);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Mode filter
      if (filters.mode && filters.mode !== 'choose_mode' && candidate.interviewMode !== filters.mode) {
        return false;
      }

      // Status 1 filter
      if (filters.status1 && filters.status1 !== 'choose_status1' && candidate.status1 !== filters.status1) {
        return false;
      }

      // Status 2 filter
      if (filters.status2 && filters.status2 !== 'choose_status2' && candidate.status2 !== filters.status2) {
        return false;
      }

      // Round filter
      if (filters.round && filters.round !== 'all_rounds' && candidate.interviewRound !== filters.round) {
        return false;
      }

      // Client name filter
      if (filters.clientName && filters.clientName !== 'all_clients' && candidate.clientName !== filters.clientName) {
        return false;
      }

      // Position filter
      if (filters.position && filters.position !== 'all_positions' && candidate.position !== filters.position) {
        return false;
      }

      // Interview date filter
      if (filters.interviewDate) {
        // If date filter is applied, only show candidates with scheduled interviews on that date
        if (!candidate.interviewDate) {
          return false; // Filter out candidates without scheduled interviews
        }
        
        const filterDate = new Date(filters.interviewDate);
        const candidateDate = new Date(candidate.interviewDate);
        
        // Compare dates (ignoring time)
        filterDate.setHours(0, 0, 0, 0);
        candidateDate.setHours(0, 0, 0, 0);
        
        if (filterDate.getTime() !== candidateDate.getTime()) {
          return false;
        }
      }

      // Manager filter
      if (filters.manager && filters.manager !== 'all_managers' && candidate.manager !== filters.manager) {
        return false;
      }

      return true;
    });
  }, [candidates, filters]);

  return {
    filters,
    filteredCandidates,
    isFilterPanelOpen,
    handleFilterChange,
    handleDateFilterChange,
    clearFilters,
    toggleFilterPanel
  };
};
