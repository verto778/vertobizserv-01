
import emailjs from 'emailjs-com';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mgaqwaf',
  PUBLIC_KEY: 'oYAv6iUOHrPBTL0VU',
  TEMPLATE_CONFIRMED: 'template_tmna3ah',     // For all rounds when status is Confirmed
  TEMPLATE_YET_TO_CONFIRM: 'template_i7qjtgo' // When status is Yet to Confirm
};

export const initEmailJS = () => {
  console.log('Email service initialized - using EmailJS from frontend');
};

export const sendConfirmationEmail = async (candidate: any, emailType: 'confirmed' | 'yet_to_confirm' = 'confirmed') => {
  try {
    console.log('=== EMAIL SENDING VIA EMAILJS FRONTEND ===');
    console.log('Sending email for candidate:', candidate.name);
    console.log('Email type:', emailType);

    // Validate required email data
    if (!candidate.email || !candidate.email.includes('@')) {
      console.error('❌ Invalid email address:', candidate.email);
      return false;
    }

    // Handle interview time
    let interviewTime = candidate.interviewTime;
    if (!interviewTime || interviewTime.trim() === '') {
      interviewTime = '10:00 AM';
      console.warn('⚠️ No interview time provided, using default');
    }

    // Handle interview date
    let formattedInterviewDate = 'To be confirmed';
    if (candidate.interviewDate && candidate.interviewDate !== null) {
      try {
        let dateToFormat = candidate.interviewDate;
        
        if (!(dateToFormat instanceof Date)) {
          dateToFormat = new Date(dateToFormat);
        }
        
        if (!isNaN(dateToFormat.getTime()) && dateToFormat.getTime() > 0) {
          formattedInterviewDate = dateToFormat.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch (dateError) {
        console.warn('⚠️ Error formatting interview date, using default:', dateError);
      }
    }

    // Determine template
    const templateId = emailType === 'confirmed' 
      ? EMAILJS_CONFIG.TEMPLATE_CONFIRMED 
      : EMAILJS_CONFIG.TEMPLATE_YET_TO_CONFIRM;
    
    console.log(`✅ Using template: ${templateId} for email type: ${emailType}`);

    // Prepare email parameters
    const emailParams = {
      subject: `Interview ${emailType === 'confirmed' ? 'Confirmation' : 'Notification'} - ${candidate.position} at ${candidate.clientName}`,
      to_email: candidate.email,
      client_name: candidate.clientName,
      reply_to: 'interview@vertobizserv.com',
      
      candidate_name: candidate.name,
      client: candidate.clientName,
      position: candidate.position,
      mode: candidate.interviewMode,
      interview_date: formattedInterviewDate,
      interview_time: interviewTime,
      interview_round: candidate.interviewRound,
      
      to_name: candidate.name,
      round: candidate.interviewRound,
      from_name: candidate.clientName || 'Interview Scheduling System',
      from_email: 'interview@vertobizserv.com',
      recruiter_name: candidate.recruiterName || 'Recruitment Team',
      contact_info: 'interview@vertobizserv.com'
    };

    console.log('✅ Email parameters prepared:', emailParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      templateId,
      emailParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log('✅ Email sent successfully');
      console.log('🎉 EMAIL DELIVERY CONFIRMED');
      return true;
    } else {
      console.error('❌ EmailJS error:', response);
      return false;
    }

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};
