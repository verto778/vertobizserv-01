
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        console.log('Starting super admin check...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session);
        
        if (!session) {
          console.log('No session found');
          setIsSuperAdmin(false);
          setIsLoading(false);
          return;
        }

        console.log('User email:', session.user.email);
        console.log('User metadata:', session.user.user_metadata);
        console.log('Calling check-super-admin function...');

        // Call our Edge Function to check super admin status
        const { data, error } = await supabase.functions.invoke('check-super-admin');
        
        console.log('Edge function response:', { data, error });
        
        if (error) {
          console.error('Error checking super admin status:', error);
          toast({
            title: "Access Check Failed",
            description: `Could not verify admin permissions: ${error.message}`,
            variant: "destructive"
          });
          setIsSuperAdmin(false);
        } else {
          console.log('Super admin check result:', data);
          setIsSuperAdmin(data.isSuperAdmin);
          if (!data.isSuperAdmin) {
            toast({
              title: "Access Denied",
              description: `Super Admin privileges required. Current email: ${session.user.email}, Role: ${data.currentRole || 'user'}`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Super Admin Access Granted",
              description: `Welcome to the admin panel! Role: ${data.currentRole}`,
            });
          }
        }
      } catch (error: any) {
        console.error('Super admin check error:', error);
        toast({
          title: "Error",
          description: `Super admin check failed: ${error.message}`,
          variant: "destructive"
        });
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isSuperAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
