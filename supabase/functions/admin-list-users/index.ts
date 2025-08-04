
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
    console.log('Starting admin-list-users function')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify super admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.log('User error or no user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No valid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const superAdminEmail = Deno.env.get('SUPER_ADMIN_EMAIL')
    
    if (!superAdminEmail) {
      console.error('SUPER_ADMIN_EMAIL environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error', 
          details: 'Super admin email not configured in Supabase secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (user.email !== superAdminEmail) {
      console.log(`Access denied: ${user.email} is not super admin (${superAdminEmail})`)
      return new Response(
        JSON.stringify({ 
          error: 'Access Denied', 
          details: `Super Admin access required. Current user: ${user.email}` 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }

    // Filter out sensitive information and format for frontend
    const users = usersData.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      is_super_admin: user.email === superAdminEmail
    }))

    // Log the admin action
    try {
      await supabaseClient
        .from('admin_actions')
        .insert({
          admin_email: user.email,
          action: 'list_users',
          target_user: 'all',
          details: { 
            timestamp: new Date().toISOString(),
            user_count: users.length
          }
        })
    } catch (logError) {
      console.log('Could not log admin action (table might not exist):', logError)
    }

    console.log(`Successfully listed ${users.length} users for super admin: ${user.email}`)

    return new Response(
      JSON.stringify({ 
        users,
        total_count: users.length,
        super_admin_email: superAdminEmail
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
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
