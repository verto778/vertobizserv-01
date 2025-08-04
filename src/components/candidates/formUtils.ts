
import { Candidate, Client } from './types';
import { toast } from '@/hooks/use-toast';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    toast({
      title: "Invalid Phone Number",
      description: "Please enter a valid phone number with country code",
      variant: "destructive"
    });
    return false;
  }
  return true;
};

export const validateRequiredSelects = (
  interviewMode: string, 
  status1: string, 
  status2: string
): boolean => {
  if (interviewMode === 'choose_mode' || status1 === 'choose_status1' || status2 === 'choose_status2') {
    toast({
      title: "Incomplete Selection",
      description: "Please select values for Interview Mode, Status 1, and Status 2",
      variant: "destructive"
    });
    return false;
  }
  return true;
};

export const validateClient = (clientId: string, clients: Client[]): Client | null => {
  const selectedClient = clients.find(client => client.id === clientId);
  if (!selectedClient) {
    toast({
      title: "Client Not Selected",
      description: "Please select a client before proceeding",
      variant: "destructive"
    });
    return null;
  }
  return selectedClient;
};

export const prepareFormData = (
  formData: {
    id: string;
    name: string;
    position: string;
    contactNumber: string;
    email: string; // Added email field
    interviewTime: string;
    interviewRound: string;
    interviewMode: string;
    status1: string;
    status2: string;
    recruiterName: string;
  },
  clientId: string,
  selectedClient: Client,
  selectedInterviewDate: Date,
  selectedDateInformed: Date,
  isEditing: boolean
): Candidate => {
  return {
    id: isEditing ? formData.id : Date.now().toString(),
    name: formData.name,
    position: formData.position,
    contactNumber: formData.contactNumber,
    email: formData.email, // Added email field
    interviewTime: formData.interviewTime,
    interviewRound: formData.interviewRound,
    interviewMode: formData.interviewMode,
    status1: formData.status1,
    status2: formData.status2,
    clientId: clientId,
    clientName: selectedClient.companyName,
    recruiterName: formData.recruiterName,
    interviewDate: selectedInterviewDate,
    dateInformed: selectedDateInformed,
  };
};
