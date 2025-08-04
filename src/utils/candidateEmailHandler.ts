
import { Candidate } from '@/components/candidates/types';
import { sendConfirmationEmail } from '@/utils/emailService';

export const handleCandidateEmail = async (
  candidate: Candidate, 
  isNew: boolean, 
  previousCandidate?: Candidate,
  skipEmail: boolean = false
) => {
  // If skipEmail is true, don't send any email
  if (skipEmail) {
    console.log('⏭️ Email sending skipped by user choice');
    return {
      emailSent: false,
      message: isNew ? "Candidate Added" : "Candidate Updated",
      description: `${candidate.name} ${isNew ? 'has been added' : 'information has been updated'} successfully (email skipped)`
    };
  }

  // Check if status changed to Confirmed
  const statusChangedToConfirmed = isNew 
    ? candidate.status1 === "Confirmed"
    : previousCandidate?.status1 !== 'Confirmed' && candidate.status1 === 'Confirmed';

  // Check if status changed to Yet to Confirm
  const statusChangedToYetToConfirm = isNew 
    ? candidate.status1 === "Yet to Confirm"
    : previousCandidate?.status1 !== 'Yet to Confirm' && candidate.status1 === 'Yet to Confirm';

  // Check if round changed while status is already Confirmed
  const roundChangedWhileConfirmed = !isNew && 
    candidate.status1 === 'Confirmed' && 
    previousCandidate?.status1 === 'Confirmed' &&
    previousCandidate?.interviewRound !== candidate.interviewRound;

  const shouldSendConfirmedEmail = statusChangedToConfirmed || roundChangedWhileConfirmed;
  const shouldSendYetToConfirmEmail = statusChangedToYetToConfirm;

  if (!shouldSendConfirmedEmail && !shouldSendYetToConfirmEmail) {
    let message = '';
    if (isNew) {
      message = `ℹ️ New candidate status is ${candidate.status1}, no email will be sent`;
      console.log(message);
    } else {
      message = `ℹ️ Status change does not trigger email sending`;
      console.log(message);
      console.log('Previous status:', previousCandidate?.status1);
      console.log('New status:', candidate.status1);
    }
    
    return {
      emailSent: false,
      message: isNew ? "Candidate Added" : "Candidate Updated",
      description: `${candidate.name} ${isNew ? 'has been added' : 'information has been updated'} successfully`
    };
  }

  // Determine email type and reason
  let emailType: 'confirmed' | 'yet_to_confirm' = 'confirmed';
  let emailReason = '';

  if (shouldSendConfirmedEmail) {
    emailType = 'confirmed';
    if (isNew) {
      emailReason = 'new candidate with Confirmed status';
      console.log('🆕 New candidate with Confirmed status, preparing to send email...');
    } else if (statusChangedToConfirmed) {
      emailReason = 'status change to Confirmed';
      console.log('🔄 Status changed to Confirmed during update, preparing to send email...');
      console.log('Previous status:', previousCandidate?.status1);
      console.log('New status:', candidate.status1);
    } else if (roundChangedWhileConfirmed) {
      emailReason = 'round change while Confirmed';
      console.log('🔄 Round changed while status is Confirmed, preparing to send email...');
      console.log('Previous round:', previousCandidate?.interviewRound);
      console.log('New round:', candidate.interviewRound);
    }
  } else if (shouldSendYetToConfirmEmail) {
    emailType = 'yet_to_confirm';
    emailReason = isNew ? 'new candidate with Yet to Confirm status' : 'status change to Yet to Confirm';
    console.log(`🔄 Status changed to Yet to Confirm, preparing to send email...`);
    console.log('Previous status:', previousCandidate?.status1);
    console.log('New status:', candidate.status1);
  }

  // Prepare candidate data with proper time
  const emailCandidate = {
    ...candidate,
    interviewTime: candidate.interviewTime || '10:00 AM'
  };
  
  console.log(`📧 Attempting to send ${emailType} email for ${isNew ? 'new' : 'updated'} candidate...`);
  console.log('Email candidate data:', emailCandidate);
  
  try {
    const emailSent = await sendConfirmationEmail(emailCandidate, emailType);
    
    if (emailSent) {
      console.log(`✅ Email sent successfully for ${isNew ? 'new' : 'updated'} candidate`);
      return {
        emailSent: true,
        message: `Candidate ${isNew ? 'Added' : 'Updated'} & Email Sent`,
        description: `${candidate.name} ${isNew ? 'added' : 'updated'} successfully and ${emailType === 'confirmed' ? 'confirmation' : 'notification'} email sent to ${candidate.email} (${emailReason})`
      };
    } else {
      console.error(`❌ Email sending failed for ${isNew ? 'new' : 'updated'} candidate`);
      return {
        emailSent: false,
        message: `Candidate ${isNew ? 'Added' : 'Updated'}`,
        description: `${candidate.name} ${isNew ? 'added' : 'updated'} successfully but email sending failed. Check console logs.`,
        variant: "destructive" as const
      };
    }
  } catch (emailError) {
    console.error('💥 Error sending email:', emailError);
    return {
      emailSent: false,
      message: `Candidate ${isNew ? 'Added' : 'Updated'}`,
      description: `${candidate.name} ${isNew ? 'added' : 'updated'} successfully but email sending failed. Check console logs.`,
      variant: "destructive" as const
    };
  }
};
