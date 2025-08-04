
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
    const { targetUserEmail, newPassword } = await req.json()

    if (!targetUserEmail || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const superAdminEmail = Deno.env.get('SUPER_ADMIN_EMAIL')
    
    if (!superAdminEmail || user.email !== superAdminEmail) {
      return new Response(
        JSON.stringify({ error: 'Super Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the target user
    const { data: targetUser, error: findError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (findError) {
      throw findError
    }

    const userToUpdate = targetUser.users.find(u => u.email === targetUserEmail)
    
    if (!userToUpdate) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reset the user's password
    const { data, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userToUpdate.id,
      { password: newPassword }
    )

    if (resetError) {
      throw resetError
    }

    // Log the admin action
    await supabaseClient
      .from('admin_actions')
      .insert({
        admin_email: user.email,
        action: 'password_reset',
        target_user: targetUserEmail,
        details: { 
          timestamp: new Date().toISOString(),
          target_user_id: userToUpdate.id
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Password reset successfully for ${targetUserEmail}`,
        targetUserId: userToUpdate.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
