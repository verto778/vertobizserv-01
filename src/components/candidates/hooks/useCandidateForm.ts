
import { useState, useEffect } from 'react';
import { Candidate, Client } from '../types';
import { CandidateFormProps } from '../CandidateForm';
import { validatePhoneNumber, validateRequiredSelects, validateClient, prepareFormData } from '../formUtils';
import { toast } from '@/hooks/use-toast';

export const useCandidateForm = ({
  clients,
  onSubmit,
  editCandidate,
  isEditing,
  onClose
}: CandidateFormProps) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedInterviewDate, setSelectedInterviewDate] = useState<Date>(new Date());
  const [selectedDateInformed, setSelectedDateInformed] = useState<Date>(new Date());
  const [showClientWarning, setShowClientWarning] = useState(false);
  const [isPositionDisabled, setIsPositionDisabled] = useState(true);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    position: '',
    contactNumber: '',
    email: '',
    interviewTime: '10:00',
    interviewRound: 'Round 1',
    interviewMode: 'choose_mode',
    status1: 'choose_status1',
    status2: 'choose_status2',
    recruiterName: '',
  });

  useEffect(() => {
    if (isEditing && editCandidate) {
      setFormData({
        id: editCandidate.id,
        name: editCandidate.name,
        position: editCandidate.position,
        contactNumber: editCandidate.contactNumber,
        email: editCandidate.email || '',
        interviewTime: editCandidate.interviewTime,
        interviewRound: editCandidate.interviewRound,
        interviewMode: editCandidate.interviewMode || 'choose_mode',
        status1: editCandidate.status1 || 'choose_status1',
        status2: editCandidate.status2 || 'choose_status2',
        recruiterName: editCandidate.recruiterName,
      });
      setSelectedClientId(editCandidate.clientId);
      setSelectedInterviewDate(editCandidate.interviewDate);
      setSelectedDateInformed(editCandidate.dateInformed);
      
      if (editCandidate.clientId) {
        setShowClientWarning(false);
        
        const selectedClient = clients.find(client => client.id === editCandidate.clientId);
        if (selectedClient) {
          setAvailablePositions([selectedClient.position]);
          setIsPositionDisabled(false);
        }
      }
    }
  }, [isEditing, editCandidate, clients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowClientWarning(false);
    
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setAvailablePositions([selectedClient.position]);
      setIsPositionDisabled(false);
      
      setFormData({
        ...formData,
        position: selectedClient.position,
      });
    }
  };

  const handlePositionClick = () => {
    if (isPositionDisabled) {
      setShowClientWarning(true);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      position: '',
      contactNumber: '',
      email: '',
      interviewTime: '10:00',
      interviewRound: 'Round 1',
      interviewMode: 'choose_mode',
      status1: 'choose_status1',
      status2: 'choose_status2',
      recruiterName: '',
    });
    setSelectedClientId('');
    setSelectedInterviewDate(new Date());
    setSelectedDateInformed(new Date());
    setIsPositionDisabled(true);
    setAvailablePositions([]);
    setShowClientWarning(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(formData.contactNumber)) return;
    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    if (!validateRequiredSelects(formData.interviewMode, formData.status1, formData.status2)) return;

    const selectedClient = validateClient(selectedClientId, clients);
    if (!selectedClient) return;

    const candidateData = prepareFormData(
      formData,
      selectedClientId,
      selectedClient,
      selectedInterviewDate,
      selectedDateInformed,
      isEditing
    );

    onSubmit(candidateData);
    resetForm();
    onClose();
  };

  return {
    formData,
    selectedClientId,
    selectedInterviewDate,
    selectedDateInformed,
    showClientWarning,
    isPositionDisabled,
    availablePositions,
    handleInputChange,
    handleSelectChange,
    setFormData,
    handleClientSelect,
    handlePositionClick,
    setSelectedInterviewDate,
    setSelectedDateInformed,
    handleFormSubmit,
  };
};
