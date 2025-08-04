
export interface Client {
  id: string;
  companyName: string;
  recruiterName: string;
  position: string;
  email: string;
}

export interface Position {
  id: string;
  name: string;
  isActive: boolean;
  clientId: string;
  clientName: string;
}

export interface Candidate {
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
  manager?: string; // Manager field
}
