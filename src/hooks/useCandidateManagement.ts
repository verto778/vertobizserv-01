
import { useState, useEffect, useMemo } from 'react';
import { Candidate } from '@/components/candidates/types';
import { toast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { candidateService } from '@/services/candidateService';
import { searchCandidates } from '@/utils/candidateSearch';
import { handleCandidateEmail } from '@/utils/candidateEmailHandler';

export const useCandidateManagement = () => {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Apply search filtering to all candidates
  const filteredCandidates = useMemo(() => {
    console.log('Searching candidates with term:', debouncedSearchTerm);
    const filtered = searchCandidates(allCandidates, debouncedSearchTerm);
    console.log('Filtered candidates count:', filtered.length);
    return filtered;
  }, [allCandidates, debouncedSearchTerm]);

  // Sort candidates based on sortOrder
  const sortedCandidates = useMemo(() => {
    if (sortOrder === 'none') return filteredCandidates;
    
    return [...filteredCandidates].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [filteredCandidates, sortOrder]);

  // Load all candidates from Supabase
  const fetchAllCandidates = async () => {
    try {
      setLoading(true);
      console.log('Fetching all candidates from Supabase...');
      const fetchedCandidates = await candidateService.fetchCandidates('');
      console.log('Fetched candidates count:', fetchedCandidates.length);
      setAllCandidates(fetchedCandidates);
    } catch (error: any) {
      console.error('Error loading candidates:', error);
      toast({
        title: "Error loading candidates",
        description: error.message || "Failed to load candidates",
        variant: "destructive",
      });
      // Try fallback to localStorage
      const storedCandidates = localStorage.getItem('candidates');
      if (storedCandidates) {
        try {
          const parsedCandidates = JSON.parse(storedCandidates, (key, value) => {
            if (key === 'interviewDate' || key === 'dateInformed') {
              return new Date(value);
            }
            return value;
          });
          setAllCandidates(parsedCandidates);
        } catch (parseError) {
          console.error('Error parsing stored candidates:', parseError);
          setAllCandidates([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load of all candidates
  useEffect(() => {
    fetchAllCandidates();
  }, []);

  // Update localStorage when candidates change
  useEffect(() => {
    if (allCandidates.length > 0) {
      localStorage.setItem('candidates', JSON.stringify(allCandidates));
    }
  }, [allCandidates]);

  const handleAddCandidate = async (candidate: Candidate) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Processing candidate data:", candidate);

      // Determine if this is an update (candidate has existing ID in our list)
      const isUpdating = candidate.id && allCandidates.some(c => c.id === candidate.id);
      const previousCandidate = isUpdating ? allCandidates.find(c => c.id === candidate.id) : undefined;

      console.log("Update check:", { 
        candidateId: candidate.id, 
        isUpdating,
        existsInList: allCandidates.some(c => c.id === candidate.id)
      });

      // ONLY check for duplicates when adding new candidates (not when updating)
      if (!isUpdating) {
        console.log("Checking for duplicate candidate (new candidate only)...");
        const duplicateCandidate = allCandidates.find(c => 
          c.email.toLowerCase() === candidate.email.toLowerCase() &&
          c.clientName === candidate.clientName &&
          c.position === candidate.position
        );

        if (duplicateCandidate) {
          console.log("Duplicate candidate found:", duplicateCandidate.id);
          toast({
            title: "Duplicate Candidate", 
            description: "Candidate with this email already exists for the same client and position.",
            variant: "default",
            className: "bg-blue-50 border-blue-200 text-blue-800",
          });
          return;
        }
        console.log("No duplicate candidate found, proceeding with new candidate creation");
      }

      // Save to database and get the returned candidate data
      const savedCandidate = await candidateService.saveCandidate(candidate, isUpdating);
      
      // Update local state with the saved candidate data from database
      if (isUpdating) {
        setAllCandidates(prevCandidates => 
          prevCandidates.map(c => c.id === candidate.id ? savedCandidate : c)
        );
      } else {
        setAllCandidates(prevCandidates => [...prevCandidates, savedCandidate]);
      }
      
      // Handle email sending
      const emailResult = await handleCandidateEmail(savedCandidate, !isUpdating, previousCandidate);
      
      toast({
        title: emailResult.message,
        description: emailResult.description, 
        variant: emailResult.variant,
      });
        
    } catch (error: any) {
      console.error('💥 Error saving candidate:', error);
      
      const errorMessage = error.message || "Failed to save candidate data";
      
      toast({
        title: "Error saving candidate",
        description: errorMessage,
        variant: "destructive", 
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    console.log('handleDeleteCandidate called with:', {
      candidateId,
      type: typeof candidateId,
      length: candidateId?.length,
      trimmed: candidateId?.trim()
    });
    
    // Validate candidate ID
    if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
      console.error('Cannot delete candidate: invalid ID format');
      toast({
        title: "Error",
        description: "Cannot delete candidate: invalid ID format",
        variant: "destructive",
      });
      return;
    }

    // Check if candidate exists in current list
    const candidateExists = allCandidates.find(c => c.id === candidateId);
    if (!candidateExists) {
      console.error('Cannot delete candidate: candidate not found in current list');
      toast({
        title: "Error",
        description: "Candidate not found in current list",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to delete candidate from database:', candidateId);
      await candidateService.deleteCandidate(candidateId);
      
      console.log('Database delete successful, updating local state');
      setAllCandidates(prevCandidates => {
        const filtered = prevCandidates.filter(c => c.id !== candidateId);
        console.log('Updated candidates count:', filtered.length);
        return filtered;
      });
      
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast({
        title: "Error",
        description: `Failed to delete candidate: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return {
    candidates: sortedCandidates,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    loading,
    handleAddCandidate,
    handleDeleteCandidate,
  };
};
