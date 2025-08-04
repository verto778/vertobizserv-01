
import { Candidate } from '@/components/candidates/types';

export const searchCandidates = (candidates: Candidate[], searchQuery: string): Candidate[] => {
  if (!searchQuery) return candidates;
  
  const searchLower = searchQuery.toLowerCase().trim();
  
  return candidates.filter((candidate: Candidate) => {
    // Check if any field starts with the search query (case-insensitive)
    return (
      candidate.name.toLowerCase().startsWith(searchLower) ||
      candidate.email.toLowerCase().startsWith(searchLower) ||
      candidate.position.toLowerCase().startsWith(searchLower) ||
      candidate.contactNumber.toLowerCase().startsWith(searchLower) ||
      candidate.clientName.toLowerCase().startsWith(searchLower) ||
      candidate.recruiterName.toLowerCase().startsWith(searchLower) ||
      candidate.interviewMode.toLowerCase().startsWith(searchLower) ||
      candidate.interviewRound.toLowerCase().startsWith(searchLower) ||
      candidate.status1.toLowerCase().startsWith(searchLower)
    );
  });
};

export const loadFromLocalStorage = (searchQuery = ''): Candidate[] => {
  const storedCandidates = localStorage.getItem('candidates');
  if (!storedCandidates) return [];
  
  try {
    // Need to parse stored dates back to Date objects
    const parsedCandidates = JSON.parse(storedCandidates, (key, value) => {
      if (key === 'interviewDate' || key === 'dateInformed') {
        return new Date(value);
      }
      return value;
    });
    
    return searchCandidates(parsedCandidates, searchQuery);
  } catch (error) {
    console.error('Error parsing stored candidates:', error);
    return [];
  }
};
