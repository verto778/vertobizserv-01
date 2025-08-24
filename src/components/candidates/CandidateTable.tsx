
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

interface Client {
  id: string;
  companyName: string;
  recruiterName: string;
  position: string;
  email: string;
}

interface Position {
  id: string;
  name: string;
}

interface Candidate {
  id: string;
  interviewDate: Date | null;
  interviewTime: string;
  interviewRound: string;
  name: string;
  contactNumber: string;
  email: string;
  interviewMode: string;
  status1: string;
  status2: string;
  clientId: string;
  clientName: string;
  position: string;
  recruiterName: string;
  dateInformed: Date | null;
  remarks?: string;
  manager?: string;
}

interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete?: (candidateId: string) => void;
  positions: Position[];
}

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, onEdit, onDelete, positions }) => {
  const { isSuperAdmin } = useSuperAdmin();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [sortField, setSortField] = useState<keyof Candidate | 'interviewDateTime'>('interviewDateTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getPositionNameById = (id: string) => {
    const match = positions.find(pos => pos.id === id);
    return match ? match.name : id;
  };

  const handleSort = (field: keyof Candidate | 'interviewDateTime') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'interviewDateTime') {
      // Sort by date and time combined
      const aDateTime = a.interviewDate ? new Date(`${a.interviewDate.toDateString()} ${a.interviewTime || '00:00'}`) : new Date(0);
      const bDateTime = b.interviewDate ? new Date(`${b.interviewDate.toDateString()} ${b.interviewTime || '00:00'}`) : new Date(0);
      aValue = aDateTime.getTime();
      bValue = bDateTime.getTime();
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle null/undefined values
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortDirection === 'asc' ? 1 : -1;
    if (!bValue) return sortDirection === 'asc' ? -1 : 1;
    
    return 0;
  });

  const handleDeleteClick = (candidate: Candidate) => {
    console.log('Delete clicked for candidate:', {
      id: candidate.id,
      name: candidate.name,
      idType: typeof candidate.id,
      idLength: candidate.id?.length
    });
    setCandidateToDelete(candidate);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!candidateToDelete || !onDelete) {
      console.error('Cannot delete: missing candidate or onDelete function');
      return;
    }

    const candidateId = candidateToDelete.id;
    
    // Validate candidate ID
    if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
      console.error('Cannot delete candidate: invalid ID');
      return;
    }

    console.log('Proceeding with delete for candidate:', {
      id: candidateId,
      name: candidateToDelete.name
    });
    
    onDelete(candidateId);
    setDeleteConfirmOpen(false);
    setCandidateToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCandidateToDelete(null);
  };

  const SortButton: React.FC<{ field: keyof Candidate | 'interviewDateTime'; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  );

  if (candidates.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No candidates added yet. Add a candidate to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="interviewDateTime">Interview Date & Time</SortButton>
            </TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>
              <SortButton field="status1">Status 1</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status2">Status 2</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="clientName">Client</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="position">Position</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="recruiterName">Recruiter</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="manager">Manager</SortButton>
            </TableHead>
            <TableHead>Info Date</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>
                {candidate.interviewDate ? (
                  `${format(candidate.interviewDate, 'PP')} ${candidate.interviewTime ? `at ${candidate.interviewTime}` : ''}`
                ) : (
                  'Not scheduled'
                )}
              </TableCell>
              <TableCell>{candidate.interviewRound}</TableCell>
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.contactNumber}</TableCell>
              <TableCell>{candidate.email || 'N/A'}</TableCell>
              <TableCell>{candidate.interviewMode}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                  candidate.status1 === "Attended" && "bg-green-100 text-green-800",
                  candidate.status1 === "Confirmed" && "bg-blue-100 text-blue-800",
                  candidate.status1 === "Yet to Confirm" && "bg-yellow-100 text-yellow-800",
                  candidate.status1 === "Not Attended" && "bg-red-100 text-red-800",
                  candidate.status1 === "Not Interested" && "bg-gray-100 text-gray-800",
                  candidate.status1 === "Client Conf Pending" && "bg-indigo-100 text-indigo-800",
                  candidate.status1 === "Position Hold" && "bg-purple-100 text-purple-800",
                  candidate.status1 === "Reschedule" && "bg-orange-100 text-orange-800",
                )}>
                  {candidate.status1}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                  candidate.status2 === "Selected" && "bg-green-100 text-green-800",
                  candidate.status2 === "Shortlisted" && "bg-blue-100 text-blue-800",
                  candidate.status2 === "Hold" && "bg-yellow-100 text-yellow-800",
                  candidate.status2 === "Interview Reject" && "bg-red-100 text-red-800",
                  candidate.status2 === "Final Reject" && "bg-red-100 text-red-800",
                  candidate.status2 === "Drop" && "bg-gray-100 text-gray-800",
                  candidate.status2 === "Documentation" && "bg-purple-100 text-purple-800",
                  candidate.status2 === "Feedback Awaited" && "bg-orange-100 text-orange-800",
                )}>
                  {candidate.status2}
                </span>
              </TableCell>
              <TableCell>{candidate.clientName}</TableCell>
              <TableCell>{getPositionNameById(candidate.position)}</TableCell>
              <TableCell>{candidate.recruiterName}</TableCell>
              <TableCell>{candidate.manager || '-'}</TableCell>
              <TableCell>
                {candidate.dateInformed ? format(candidate.dateInformed, 'PP') : 'Not set'}
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate" title={candidate.remarks || ''}>
                  {candidate.remarks || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(candidate)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {isSuperAdmin && onDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(candidate)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{candidateToDelete?.name}</strong>? 
              This action cannot be undone and will permanently remove all candidate information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CandidateTable;
