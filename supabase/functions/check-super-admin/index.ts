
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting check-super-admin function')
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create regular client for the current user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.log('User error or no user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No valid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User found:', user.email)
    console.log('User metadata:', user.user_metadata)

    // Get super admin email from secrets
    const superAdminEmail = Deno.env.get('SUPER_ADMIN_EMAIL')
    
    if (!superAdminEmail) {
      console.error('SUPER_ADMIN_EMAIL environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error', 
          details: 'Super admin email not configured in Supabase secrets',
          isSuperAdmin: false,
          adminEmail: user.email,
          currentRole: user.user_metadata?.role || 'user'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Super admin email from env:', superAdminEmail)
    console.log('Current user email:', user.email)

    // Check if current user is super admin
    const isSuperAdmin = user.email === superAdminEmail

    console.log('Is super admin?', isSuperAdmin)

    // If this user should be super admin but doesn't have the role in metadata, update it
    if (isSuperAdmin && (!user.user_metadata?.role || user.user_metadata.role !== 'superadmin')) {
      console.log('Updating user metadata to add superadmin role')
      
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              role: 'superadmin'
            }
          }
        )

        if (updateError) {
          console.error('Error updating user metadata:', updateError)
        } else {
          console.log('Successfully updated user metadata with superadmin role')
        }
      } catch (updateErr) {
        console.error('Exception updating user metadata:', updateErr)
      }
    }

    // Log the admin check attempt
    if (isSuperAdmin) {
      try {
        await supabaseClient
          .from('admin_actions')
          .insert({
            admin_email: user.email,
            action: 'super_admin_check',
            target_user: user.email,
            details: { 
              timestamp: new Date().toISOString(),
              role_in_metadata: user.user_metadata?.role || 'none'
            }
          })
      } catch (logError) {
        console.log('Could not log admin action (table might not exist):', logError)
      }
    }

    return new Response(
      JSON.stringify({ 
        isSuperAdmin,
        adminEmail: user.email,
        currentRole: user.user_metadata?.role || 'user',
        message: isSuperAdmin ? 'Super Admin access granted' : 'Regular user access',
        configuredSuperAdmin: superAdminEmail
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message,
        isSuperAdmin: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
