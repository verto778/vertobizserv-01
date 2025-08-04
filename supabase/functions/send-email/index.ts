import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { candidate, emailType = 'confirmed' } = await req.json()

    console.log('=== EMAIL SENDING DEBUG ===')
    console.log('Sending email for candidate:', candidate.name)
    console.log('Email type:', emailType)

    // Validate required email data
    if (!candidate.email || !candidate.email.includes('@')) {
      console.error('❌ Invalid email address:', candidate.email)
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get EmailJS configuration from Supabase secrets
    const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID')
    const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY')
    const EMAILJS_TEMPLATE_CONFIRMED = Deno.env.get('EMAILJS_TEMPLATE_CONFIRMED')
    const EMAILJS_TEMPLATE_YET_TO_CONFIRM = Deno.env.get('EMAILJS_TEMPLATE_YET_TO_CONFIRM')

    console.log('🔍 Environment variables debug:')
    console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID ? 'SET' : 'MISSING')
    console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING')
    console.log('EMAILJS_TEMPLATE_CONFIRMED:', EMAILJS_TEMPLATE_CONFIRMED ? 'SET' : 'MISSING')
    console.log('EMAILJS_TEMPLATE_YET_TO_CONFIRM:', EMAILJS_TEMPLATE_YET_TO_CONFIRM ? 'SET' : 'MISSING')

    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_TEMPLATE_CONFIRMED || !EMAILJS_TEMPLATE_YET_TO_CONFIRM) {
      console.error('❌ Missing EmailJS configuration')
      console.error('Available environment variables:', Object.keys(Deno.env.toObject()))
      return new Response(
        JSON.stringify({ 
          error: 'EmailJS configuration not found',
          debug: {
            EMAILJS_SERVICE_ID: !!EMAILJS_SERVICE_ID,
            EMAILJS_PUBLIC_KEY: !!EMAILJS_PUBLIC_KEY,
            EMAILJS_TEMPLATE_CONFIRMED: !!EMAILJS_TEMPLATE_CONFIRMED,
            EMAILJS_TEMPLATE_YET_TO_CONFIRM: !!EMAILJS_TEMPLATE_YET_TO_CONFIRM
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle interview time
    let interviewTime = candidate.interviewTime
    if (!interviewTime || interviewTime.trim() === '') {
      interviewTime = 'Time not specified'
      console.warn('⚠️ No interview time provided, using placeholder')
    } else {
      console.log('✅ Using provided interview time:', interviewTime)
    }

    // Handle interview date
    let formattedInterviewDate = 'To be confirmed'
    if (candidate.interviewDate && candidate.interviewDate !== null) {
      try {
        let dateToFormat = candidate.interviewDate
        
        if (!(dateToFormat instanceof Date)) {
          dateToFormat = new Date(dateToFormat)
        }
        
        if (!isNaN(dateToFormat.getTime()) && dateToFormat.getTime() > 0) {
          formattedInterviewDate = dateToFormat.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        } else {
          console.warn('⚠️ Invalid interview date, using default')
          formattedInterviewDate = 'To be confirmed'
        }
      } catch (dateError) {
        console.warn('⚠️ Error formatting interview date, using default:', dateError)
        formattedInterviewDate = 'To be confirmed'
      }
    }
    console.log('✅ Using interview date:', formattedInterviewDate)

    // Determine template
    const templateId = emailType === 'confirmed' ? EMAILJS_TEMPLATE_CONFIRMED : EMAILJS_TEMPLATE_YET_TO_CONFIRM
    console.log(`✅ Using template: ${templateId} for email type: ${emailType}`)

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
    }

    console.log('✅ Email parameters prepared:', emailParams)

    // Send email using EmailJS REST API
    const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: emailParams
      })
    })

    if (emailJSResponse.ok) {
      console.log('✅ Email sent successfully')
      console.log('🎉 EMAIL DELIVERY CONFIRMED')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      const errorText = await emailJSResponse.text()
      console.error('❌ EmailJS API error:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Failed to send email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})