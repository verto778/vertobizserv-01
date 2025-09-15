
import { useState, useEffect } from 'react';
import { Candidate, Client } from '../types';

interface UseCandidateFormProps {
  clients: Client[];
  onSubmit: (candidate: Candidate) => void;
  editCandidate?: Candidate;
  isEditing: boolean;
  onClose: () => void;
}

export function useCandidateFormExtended({
  clients,
  onSubmit,
  editCandidate,
  isEditing,
  onClose
}: UseCandidateFormProps) {
  // State for form data - remove id from here since it's handled separately
  const [formData, setFormData] = useState<Omit<Candidate, 'id' | 'interviewDate' | 'dateInformed'>>({
    name: '',
    contactNumber: '',
    email: '',
    interviewTime: '',
    interviewRound: '',
    interviewMode: '',
    status1: '',
    status2: '',
    clientId: '',
    clientName: '',
    position: '',
    recruiterName: '',
    remarks: '',
    manager: '',
  });

  // FIXED: Initialize with null dates instead of undefined to be explicit
  const [selectedInterviewDate, setSelectedInterviewDate] = useState<Date | null>(null);
  const [selectedDateInformed, setSelectedDateInformed] = useState<Date | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [useDefaultDate, setUseDefaultDate] = useState<boolean>(false);
  
  // FIXED: Simpler initialization tracking
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Helper function to safely validate dates
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    if (!(date instanceof Date)) return false;
    if (isNaN(date.getTime())) return false;
    // Check if it's the Unix epoch (invalid default) or before 1900
    if (date.getTime() <= 0 || date.getFullYear() < 1900) return false;
    return true;
  };

  // Initialize form data if editing an existing candidate
  useEffect(() => {
    if (editCandidate && isEditing && !isInitialized) {
      console.log("Initializing form with edit candidate:", editCandidate);
      console.log("Manager value from editCandidate:", editCandidate.manager);
      
      // Set form data with all preserved values - FIXED: Ensure manager is properly preserved
      setFormData({
        name: editCandidate.name || '',
        contactNumber: editCandidate.contactNumber || '',
        email: editCandidate.email || '',
        interviewTime: editCandidate.interviewTime || '',
        interviewRound: editCandidate.interviewRound === 'choose_round' ? '' : (editCandidate.interviewRound || ''),
        interviewMode: editCandidate.interviewMode === 'choose_mode' ? '' : (editCandidate.interviewMode || ''),
        status1: editCandidate.status1 || '',
        status2: editCandidate.status2 || '',
        clientId: editCandidate.clientId || '',
        clientName: editCandidate.clientName || '',
        position: editCandidate.position || '',
        recruiterName: editCandidate.recruiterName || '',
        remarks: editCandidate.remarks || '',
        manager: editCandidate.manager || '', // FIXED: Properly preserve manager field
      });
      
      // Set the selected client ID - ensure it's not empty string
      setSelectedClientId(editCandidate.clientId || '');
      
      // Only set dates if they are valid, otherwise keep them null
      setSelectedInterviewDate(isValidDate(editCandidate.interviewDate) ? editCandidate.interviewDate : null);
      setSelectedDateInformed(isValidDate(editCandidate.dateInformed) ? editCandidate.dateInformed : null);
      setUseDefaultDate(false);
      
      // Mark as initialized
      setIsInitialized(true);
      
      console.log("Form initialized with preserved values including manager:", {
        position: editCandidate.position,
        recruiterName: editCandidate.recruiterName,
        clientId: editCandidate.clientId,
        manager: editCandidate.manager // FIXED: Log manager field
      });
      
    } else if (!isEditing && !isInitialized) {
      // FIXED: For new candidates, explicitly set null dates
      setSelectedInterviewDate(null);
      setSelectedDateInformed(null);
      setUseDefaultDate(false);
      setIsInitialized(true);
      console.log("Initialized new candidate form with null dates");
    }
  }, [editCandidate, isEditing, isInitialized]);

  const handleDefaultDateToggle = (checked: boolean) => {
    console.log("Default date toggle:", checked);
    setUseDefaultDate(checked);
    if (checked) {
      // Set current date when enabled
      const currentDate = new Date();
      setSelectedInterviewDate(currentDate);
      setSelectedDateInformed(currentDate);
      console.log("Set default dates to current date:", currentDate);
    } else {
      // FIXED: Completely clear dates when disabled - set to null explicitly
      setSelectedInterviewDate(null);
      setSelectedDateInformed(null);
      // Also clear the interview time
      setFormData(prev => ({
        ...prev,
        interviewTime: ''
      }));
      console.log("Cleared all dates and time");
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Updating ${name} to:`, value, "isInitialized:", isInitialized);
    
    // FIXED: Never clear values during the initial render of edit mode
    if (!isInitialized && isEditing && editCandidate) {
      console.log(`Skipping update during initialization for ${name}`);
      return;
    }
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      console.log(`Updated ${name} in form data:`, newData[name as keyof typeof newData]);
      return newData;
    });
  };

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    
    if (selectedClient) {
      // FIXED: Ensure clientId is never empty string, use empty string or keep original value
      const safeClientId = clientId && clientId.trim() !== '' ? clientId : '';
      setSelectedClientId(safeClientId);
      setFormData(prev => ({
        ...prev,
        clientId: safeClientId,
        clientName: selectedClient.companyName,
        // FIXED: Only clear position if we're not in edit mode
        position: isEditing ? prev.position : '',
      }));
    }
  };

  const handlePositionInput = (value: string) => {
    setFormData(prev => ({
      ...prev,
      position: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Normalize manager names by trimming spaces for consistent data
    const normalizedValue = name === 'manager' ? value.trim() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  // Handle interview date change
  const handleInterviewDateChange = (date: Date | undefined) => {
    console.log("Setting interview date:", date);
    // FIXED: Convert undefined to null for consistency
    setSelectedInterviewDate(date || null);
    
    // Clear interview time when date is cleared
    if (!date) {
      setFormData(prev => ({
        ...prev,
        interviewTime: ''
      }));
    } else {
      console.log("Interview date set, current time:", formData.interviewTime);
    }
  };

  // Handle date informed change
  const handleDateInformedChange = (date: Date | undefined) => {
    console.log("Setting date informed:", date);
    // FIXED: Convert undefined to null for consistency
    setSelectedDateInformed(date || null);
  };

  // Handle form submission - REMOVED ALL VALIDATIONS
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIXED: Only set time if we actually have a time value
    const timeString = formData.interviewTime || '';
    
    // FIXED: For new candidates, don't generate UUID - let Supabase handle it
    // For editing, preserve the existing ID
    let candidateId: string;
    if (isEditing && editCandidate?.id && editCandidate.id.trim() !== '') {
      // Use existing ID if editing and ID is valid
      candidateId = editCandidate.id;
      console.log("Using existing candidate ID for edit:", candidateId);
    } else {
      // FIXED: For new candidates, use empty string - candidateService will handle it
      candidateId = '';
      console.log("New candidate - letting Supabase generate UUID");
    }
    
    // FIXED: Allow empty values - no validation
    const safeClientId = selectedClientId || '';
    const safePosition = formData.position || '';
    
    const candidateToSubmit: Candidate = {
      id: candidateId, // Empty string for new, existing ID for edits
      // FIXED: Pass actual null dates instead of default dates when not set
      interviewDate: selectedInterviewDate,
      interviewTime: timeString,
      dateInformed: selectedDateInformed,
      ...formData,
      // FIXED: Use values as-is without validation
      clientId: safeClientId,
      position: safePosition,
      manager: formData.manager || '', // FIXED: Explicitly include manager field
    };
    
    console.log("Submitting candidate with manager field:", {
      id: candidateToSubmit.id,
      clientId: safeClientId,
      position: safePosition,
      manager: candidateToSubmit.manager, // FIXED: Log manager in submission
      interviewDate: candidateToSubmit.interviewDate,
      dateInformed: candidateToSubmit.dateInformed,
    });
    onSubmit(candidateToSubmit);
  };

  return {
    formData,
    selectedClientId,
    selectedInterviewDate,
    selectedDateInformed,
    useDefaultDate,
    handleInputChange,
    handleSelectChange,
    handleClientSelect,
    handlePositionInput,
    setSelectedInterviewDate: handleInterviewDateChange,
    setSelectedDateInformed: handleDateInformedChange,
    handleDefaultDateToggle,
    handleFormSubmit,
  };
}
