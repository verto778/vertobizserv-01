
import React from 'react';
import { format } from 'date-fns';

interface CandidateConfirmationEmailProps {
  candidateName: string;
  interviewDate: Date;
  interviewTime: string;
  position: string;
  clientName: string;
  interviewMode: string;
}

// This component is kept as a reference for the email template
// EmailJS will use the template stored on their service
export const CandidateConfirmationEmail: React.FC<CandidateConfirmationEmailProps> = ({
  candidateName,
  interviewDate,
  interviewTime,
  position,
  clientName,
  interviewMode,
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#333' }}>
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#4f46e5', marginTop: '0' }}>Interview Confirmation</h2>
        <p>Hello {candidateName},</p>
        <p>
          Your interview for the <strong>{position}</strong> position at <strong>{clientName}</strong> has been confirmed.
        </p>
        
        <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontWeight: 'bold', marginTop: '0' }}>Interview Details:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Date:</strong> {format(interviewDate, 'PPPP')}</li>
            <li><strong>Time:</strong> {interviewTime}</li>
            <li><strong>Mode:</strong> {interviewMode}</li>
          </ul>
        </div>
        
        <p>
          Please make sure to be prepared and available at the scheduled time.
          If you need to reschedule or have any questions, please contact us as soon as possible.
        </p>
      </div>
      
      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
      </div>
    </div>
  );
};

// Fields for the EmailJS template:
/*
  Required variables for the EmailJS template:
  
  to_name - Candidate's name
  to_email - Candidate's email address
  interview_date - Formatted date of the interview
  interview_time - Time of the interview
  position - Position title
  client_name - Name of the client company
  interview_mode - Mode of interview (Online, In-person, etc.)
  
  Example EmailJS template:
  
  Hello {{to_name}},

  Your interview for the {{position}} position at {{client_name}} has been confirmed.

  Interview Details:
  Date: {{interview_date}}
  Time: {{interview_time}}
  Mode: {{interview_mode}}

  Please make sure to be prepared and available at the scheduled time.
  If you need to reschedule or have any questions, please contact us as soon as possible.

  This is an automated confirmation email. Please do not reply to this email.
*/
