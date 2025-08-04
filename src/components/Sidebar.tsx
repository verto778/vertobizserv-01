
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LogoutConfirmation from './LogoutConfirmation';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('Starting logout process...');
      
      // Get current session to check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session during logout:', session);
      
      if (sessionError) {
        console.error('Session error during logout:', sessionError);
      }
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        
        // Even if logout fails, we should clear local state and redirect
        if (error.message?.includes('Auth session missing') || error.message?.includes('session_not_found')) {
          console.log('Session already cleared, proceeding with navigation');
          toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
          });
        } else {
          throw error;
        }
      } else {
        console.log('Logout successful');
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
      }
      
      // Clear any local storage or session storage if needed
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.log('Storage clear error (non-critical):', storageError);
      }
      
      // Navigate to login page
      navigate('/login', { replace: true });
      
    } catch (error: any) {
      console.error('Logout process error:', error);
      
      // Check for specific error types
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast({
          title: "Network Error",
          description: "Logout failed due to network issues. You may still be logged out.",
          variant: "destructive",
        });
        
        // Clear local state and navigate anyway
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        toast({
          title: "Logout failed",
          description: error.message || "An error occurred while logging out. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirmation(false);
    }
  };
  
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-sidebar shadow-lg transition-all duration-200 ease-in-out z-10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            <img 
              src="/lovable-uploads/26ed8508-9e88-4322-a6cc-3d580b470339.png" 
              alt="VERTO Logo" 
              className={cn("h-8 w-auto", collapsed ? "h-6" : "")}
            />
          </div>
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-1 rounded-md hover:bg-sidebar-accent transition-colors duration-200",
              collapsed ? "absolute -right-3 bg-sidebar shadow-md" : ""
            )}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-white" />
            ) : (
              <ChevronLeft size={18} className="text-white" />
            )}
          </button>
        </div>

        <SidebarNav 
          collapsed={collapsed} 
          onLogoutClick={handleLogoutClick} 
        />

        <SidebarFooter collapsed={collapsed} />
      </div>
      
      <LogoutConfirmation
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
        onConfirm={handleLogout}
      />
    </aside>
  );
};

export default Sidebar;
