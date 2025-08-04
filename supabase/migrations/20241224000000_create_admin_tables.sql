
-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_email ON admin_actions(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON admin_actions(action);

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policy that only allows super admin to read admin actions
CREATE POLICY "Super admin can view admin actions" ON admin_actions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = current_setting('app.super_admin_email', true)
    )
  );

-- Create policy that only allows super admin to insert admin actions
CREATE POLICY "Super admin can insert admin actions" ON admin_actions
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = current_setting('app.super_admin_email', true)
    )
  );

-- Grant necessary permissions
GRANT ALL ON admin_actions TO authenticated;
GRANT ALL ON admin_actions TO service_role;
