import React, { useEffect, useState } from 'react';
import { Candidate, Client } from './types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCandidateFormExtended } from './hooks/useCandidateFormExtended';
import { usePositions } from '@/hooks/usePositions';
import InterviewSection from './form-sections/InterviewSection';
import PersonalInfoSection from './form-sections/PersonalInfoSection';
import StatusSection from './form-sections/StatusSection';
import ClientSection from './form-sections/ClientSection';
import RecruiterSection from './form-sections/RecruiterSection';
import RemarksSection from './form-sections/RemarksSection';
import { ManagerSection } from './form-sections/ManagerSection';
import FormField from '../FormField';

export interface CandidateFormProps {
  clients: Client[];
  onSubmit: (candidate: Candidate) => Promise<any>;
  editCandidate?: Candidate;
  isEditing: boolean;
  onClose: () => void;
}

const CandidateForm = ({
  clients,
  onSubmit,
  editCandidate,
  isEditing,
  onClose
}: CandidateFormProps) => {
  // Fetch all positions for ID to name conversion
  const { positions: allPositions } = usePositions(true);
  
  const {
    formData,
    selectedClientId,
    selectedInterviewDate,
    selectedDateInformed,
    useDefaultDate,
    handleInputChange,
    handleSelectChange,
    handleClientSelect,
    setSelectedInterviewDate,
    setSelectedDateInformed,
    handleDefaultDateToggle,
    handleFormSubmit,
  } = useCandidateFormExtended({ clients, onSubmit, editCandidate, isEditing, onClose });

  // Create a current candidate object to pass to StatusSection
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | undefined>(editCandidate);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    contactNumber?: string;
    clientId?: string;
    position?: string;
  }>({});
  
  // State to track if we're in the initialization phase for edit mode
  const [isInitializing, setIsInitializing] = useState(isEditing);

  // Position should not be disabled when editing if there's a selected client
  const isPositionDisabled = !selectedClientId;

  // Handle cascading dropdown initialization for edit mode
  useEffect(() => {
    if (isEditing && editCandidate && isInitializing) {
      console.log("Initializing cascading dropdowns for edit mode:", editCandidate);
      
      // Small delay to ensure all hooks are properly initialized
      const timer = setTimeout(() => {
        // The client should already be set by the form hook
        console.log("Edit mode initialization complete");
        setIsInitializing(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isEditing, editCandidate, isInitializing]);

  // Validation function for required fields (only for new candidates)
  const validateRequiredFields = () => {
    if (isEditing) return true; // Skip validation for editing

    const errors: typeof validationErrors = {};
    let hasErrors = false;

    if (!formData.name.trim()) {
      errors.name = 'This field is required';
      hasErrors = true;
    }

    if (!formData.email.trim()) {
      errors.email = 'This field is required';
      hasErrors = true;
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'This field is required';
      hasErrors = true;
    }

    if (!selectedClientId) {
      errors.clientId = 'This field is required';
      hasErrors = true;
    }

    if (!formData.position.trim()) {
      errors.position = 'This field is required';
      hasErrors = true;
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  // Clear validation errors when fields are updated
  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    handleInputChange(e);
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleClientSelectWithValidation = (clientId: string) => {
    handleClientSelect(clientId);
    
    // Clear validation errors for client and position when client is selected
    if (validationErrors.clientId || validationErrors.position) {
      setValidationErrors(prev => ({
        ...prev,
        clientId: undefined,
        position: undefined
      }));
    }
  };

  const handleSelectChangeWithValidation = (name: string, value: string) => {
    handleSelectChange(name, value);
    
    // Clear validation error for position when it's selected
    if (name === 'position' && validationErrors.position) {
      setValidationErrors(prev => ({
        ...prev,
        position: undefined
      }));
    }
  };

  // Update the current candidate when form data changes
  useEffect(() => {
    if (formData) {
      const candidate: Candidate = {
        id: isEditing && editCandidate ? editCandidate.id : '',
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        // FIXED: Use actual selected dates or null
        interviewDate: selectedInterviewDate,
        interviewTime: formData.interviewTime,
        interviewRound: formData.interviewRound,
        interviewMode: formData.interviewMode,
        status1: formData.status1,
        status2: formData.status2,
        clientId: selectedClientId,
        clientName: formData.clientName || '',
        // FIXED: Convert position ID to name for display, but keep ID for storage
        position: allPositions.find(p => p.id === formData.position)?.name || formData.position,
        recruiterName: formData.recruiterName,
        // FIXED: Use actual selected date or null
        dateInformed: selectedDateInformed,
        remarks: formData.remarks,
        manager: formData.manager,
      };
      setCurrentCandidate(candidate);
      console.log("Updated current candidate with dates and manager:", {
        interviewDate: candidate.interviewDate,
        dateInformed: candidate.dateInformed,
        manager: candidate.manager,
        name: candidate.name
      });
    }
  }, [formData, selectedInterviewDate, selectedDateInformed, selectedClientId, isEditing, editCandidate, allPositions]);

  // Function to check if email would be sent
  const wouldSendEmail = (newStatus1: string, newRound: string) => {
    if (!isEditing || !editCandidate) {
      // New candidate - check if status is Confirmed or Yet to Confirm
      return newStatus1 === "Confirmed" || newStatus1 === "Yet to Confirm";
    }

    // Existing candidate - check for status changes or round changes while Confirmed
    const statusChangedToConfirmed = editCandidate.status1 !== 'Confirmed' && newStatus1 === 'Confirmed';
    const statusChangedToYetToConfirm = editCandidate.status1 !== 'Yet to Confirm' && newStatus1 === 'Yet to Confirm';
    const roundChangedWhileConfirmed = newStatus1 === 'Confirmed' && 
      editCandidate.status1 === 'Confirmed' &&
      editCandidate.interviewRound !== newRound;

    return statusChangedToConfirmed || statusChangedToYetToConfirm || roundChangedWhileConfirmed;
  };

  // Modified form submit handler with validation
  const handleFormSubmitWithConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate for new candidates, not when editing
    if (!isEditing && !validateRequiredFields()) {
      return; // Stop submission if validation fails
    }
    
    try {
      // Check if email would be sent
      if (wouldSendEmail(formData.status1, formData.interviewRound)) {
        // Store the form event and show email confirmation dialog
        setPendingFormData(e);
        setShowEmailConfirmation(true);
      } else {
        // Directly submit the form and close dialog
        await onSubmit(currentCandidate!);
        onClose();
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  // Handle confirmed email send
  const handleConfirmEmailSend = async () => {
    setShowEmailConfirmation(false);
    if (pendingFormData && currentCandidate) {
      await onSubmit(currentCandidate);
      setPendingFormData(null);
      onClose();
    }
  };

  // Handle cancelled email send
  const handleCancelEmailSend = async () => {
    setShowEmailConfirmation(false);
    if (pendingFormData && currentCandidate) {
      await onSubmit(currentCandidate);
      setPendingFormData(null);
      onClose();
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmitWithConfirmation} className="space-y-8">
        {/* Date Setting Option - Only show when adding new candidate */}
        {!isEditing && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="useDefaultDate"
                checked={useDefaultDate}
                onCheckedChange={handleDefaultDateToggle}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex flex-col">
                <label
                  htmlFor="useDefaultDate"
                  className="text-sm font-medium text-blue-800 cursor-pointer"
                >
                  Set current date as default
                </label>
                <p className="text-xs text-blue-600">
                  {useDefaultDate 
                    ? "Interview and informed dates will be set to today's date" 
                    : "Dates will be left empty for manual entry"
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-md font-medium text-blue-700 mb-3">Interview Details</h3>
          <InterviewSection
            interviewDate={selectedInterviewDate}
            interviewRound={formData.interviewRound}
            interviewMode={formData.interviewMode}
            interviewTime={formData.interviewTime}
            setSelectedInterviewDate={setSelectedInterviewDate}
            handleSelectChange={handleSelectChangeWithValidation}
          />
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-md font-medium text-blue-700 mb-3">Candidate Information</h3>
          <PersonalInfoSection
            name={formData.name}
            contactNumber={formData.contactNumber}
            email={formData.email}
            handleInputChange={handleInputChangeWithValidation}
            requiredFieldErrors={validationErrors}
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-md font-medium text-blue-700 mb-3">Status & Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="status1" label="Status 1">
              <StatusSection
                status1={formData.status1}
                status2={formData.status2}
                handleSelectChange={handleSelectChangeWithValidation}
                showStatus2={false}
                candidate={currentCandidate}
              />
            </FormField>
            
            <FormField id="status2" label="Status 2">
              <StatusSection
                status1={formData.status1}
                status2={formData.status2}
                handleSelectChange={handleSelectChangeWithValidation}
                showStatus1={false}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1.5">
                Client<span className="text-red-500 ml-1">*</span>
              </div>
              <ClientSection
                clients={clients}
                selectedClientId={selectedClientId}
                position={allPositions.find(p => p.id === formData.position)?.name || formData.position}
                isPositionDisabled={isPositionDisabled}
                handleClientSelect={handleClientSelectWithValidation}
                handleSelectChange={handleSelectChangeWithValidation}
                showPosition={false}
              />
              {validationErrors.clientId && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.clientId}</p>
              )}
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1.5">
                Position<span className="text-red-500 ml-1">*</span>
              </div>
              <ClientSection
                clients={clients}
                selectedClientId={selectedClientId}
                position={allPositions.find(p => p.id === formData.position)?.name || formData.position}
                isPositionDisabled={isPositionDisabled}
                handleClientSelect={handleClientSelectWithValidation}
                handleSelectChange={handleSelectChangeWithValidation}
                showClient={false}
              />
              {validationErrors.position && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.position}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-md font-medium text-blue-700 mb-3">Recruiter Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="recruiterName" label="Recruiter">
              <RecruiterSection
                recruiterName={formData.recruiterName}
                dateInformed={selectedDateInformed}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                setDateInformed={setSelectedDateInformed}
                showDateInformed={false}
              />
            </FormField>
            
            <FormField id="dateInformed" label="Date Informed">
              <RecruiterSection
                recruiterName={formData.recruiterName}
                dateInformed={selectedDateInformed}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                setDateInformed={setSelectedDateInformed}
                showRecruiter={false}
              />
            </FormField>
          </div>
        </div>

          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="text-md font-medium text-blue-700 mb-3">Manager Information</h3>
            <FormField id="manager" label="Manager">
              <ManagerSection
                value={formData.manager || ''}
                onChange={(value) => handleInputChangeWithValidation({
                  target: { name: 'manager', value }
                } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Select a manager"
              />
            </FormField>
          </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-md font-medium text-blue-700 mb-3">Additional Notes</h3>
          <FormField id="remarks" label="Remarks">
            <RemarksSection
              remarks={formData.remarks || ''}
              handleInputChange={handleInputChange}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onClose} className="px-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-800">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? 'Update Candidate' : 'Add Candidate'}
          </Button>
        </div>
      </form>

      {/* Email Confirmation Dialog */}
      <AlertDialog open={showEmailConfirmation} onOpenChange={setShowEmailConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Send</AlertDialogTitle>
            <AlertDialogDescription>
              This action will trigger an email to be sent to the candidate. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEmailSend}>
              Cancel (No Email)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEmailSend}>
              Yes, Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CandidateForm;
