
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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Validating user for password reset:', email)

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error listing auth users:', authError)
      throw authError
    }

    const authUser = authUsers.users.find(user => user.email === email)
    
    if (!authUser) {
      return new Response(
        JSON.stringify({ 
          exists: false,
          message: 'Email not found in system'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user found:', authUser.id)

    // Check in custom tables for additional validation
    const tablesToCheck = ['users', 'profiles', 'candidates']
    let customUserFound = false
    let userRole = 'user'

    for (const tableName of tablesToCheck) {
      try {
        const { data: customUsers, error: customError } = await supabaseAdmin
          .from(tableName)
          .select('id, email, role, user_id')
          .eq('email', email)
          .limit(1)

        if (!customError && customUsers && customUsers.length > 0) {
          customUserFound = true
          userRole = customUsers[0].role || 'user'
          console.log(`Custom user found in ${tableName}:`, customUsers[0])
          break
        }
      } catch (error) {
        console.log(`Table ${tableName} might not exist, continuing...`)
      }
    }

    // Allow reset even if not found in custom tables
    const result = {
      exists: true,
      userId: authUser.id,
      role: userRole,
      inCustomTable: customUserFound,
      message: customUserFound 
        ? `User validated with role: ${userRole}` 
        : 'User exists in auth, allowing reset'
    }

    console.log('Validation result:', result)

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in validate-user-for-reset:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        exists: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
