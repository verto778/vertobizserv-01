
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CandidateForm from "./CandidateForm";
import { Candidate } from "./types";
import { ClientExtended } from "@/types/client-extended";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (candidate: Candidate) => Promise<any>;
  editCandidate?: Candidate;
  clients: ClientExtended[];
}

export const AddCandidateDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editCandidate,
  clients,
}: AddCandidateDialogProps) => {
  const isEditing = !!editCandidate;
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [candidateData, setCandidateData] = useState<Candidate | undefined>(editCandidate);

  // Helper function to safely create dates - return null if invalid or empty
  const createSafeDate = (dateValue: any): Date | null => {
    // Return null for null, undefined, or empty string values
    if (!dateValue || dateValue === '') return null;
    
    // If it's already a Date object, validate it
    if (dateValue instanceof Date) {
      // Check if it's invalid or Unix epoch (invalid default)
      if (isNaN(dateValue.getTime()) || dateValue.getTime() <= 0 || dateValue.getFullYear() < 1900) {
        return null;
      }
      return dateValue;
    }
    
    // Try to create a new Date and check if it's valid
    const date = new Date(dateValue);
    // Check if it's invalid, Unix epoch, or before 1900 (invalid default)
    if (isNaN(date.getTime()) || date.getTime() <= 0 || date.getFullYear() < 1900) {
      return null;
    }
    
    return date;
  };

  // Fetch full candidate data from Supabase when editing
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (isEditing && editCandidate?.id) {
        try {
          setLoadingCandidate(true);
          
          const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', editCandidate.id)
            .single();

          if (error) throw error;

          if (data) {
            // Type assertion for Supabase data
            const candidateData = data as any;
            
            const mappedCandidate: Candidate = {
              id: candidateData.id,
              name: candidateData.name,
              contactNumber: candidateData.contact_number,
              email: candidateData.email || '',
              interviewDate: createSafeDate(candidateData.interview_date),
              interviewTime: candidateData.interview_time,
              interviewRound: candidateData.interview_round,
              interviewMode: candidateData.interview_mode,
              status1: candidateData.status1 || '',
              status2: candidateData.status2 || '',
              clientId: candidateData.client_id,
              clientName: candidateData.client_name,
              position: candidateData.position,
              recruiterName: candidateData.recruiter_name,
              dateInformed: createSafeDate(candidateData.date_informed),
              remarks: candidateData.remarks || '',
              manager: candidateData.Manager || '', // FIXED: Include manager field mapping
            };
            
            console.log('DIALOG DEBUG - Fetched candidate with manager:', {
              id: mappedCandidate.id,
              manager: mappedCandidate.manager,
              name: mappedCandidate.name
            });
            
            setCandidateData(mappedCandidate);
          }
        } catch (error: any) {
          console.error('Error fetching candidate:', error);
          toast({
            title: "Error loading candidate",
            description: error.message || "Failed to load candidate details",
            variant: "destructive",
          });
          // Fallback to the provided data if fetch fails
          setCandidateData(editCandidate);
        } finally {
          setLoadingCandidate(false);
        }
      } else {
        setCandidateData(editCandidate);
      }
    };

    fetchCandidateData();
  }, [editCandidate, isEditing]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-700">
            {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {isEditing ? 'update the' : 'add a new'} candidate.
          </DialogDescription>
        </DialogHeader>
        
        {loadingCandidate ? (
          <div className="py-8 text-center">Loading candidate details...</div>
        ) : (
          <CandidateForm
            clients={clients}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            isEditing={isEditing}
            editCandidate={candidateData}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
