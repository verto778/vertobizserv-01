
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users as RecruitersIcon, 
  Building,
  Settings, 
  LogOut,
  Users,
  Briefcase,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NavItem from './NavItem';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SidebarNavProps {
  collapsed: boolean;
  onLogoutClick: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed, onLogoutClick }) => {
  const location = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsSuperAdmin(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('check-super-admin');
        if (!error && data?.isSuperAdmin) {
          setIsSuperAdmin(true);
        }
      } catch (error) {
        console.log('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdminStatus();
  }, []);
  
  return (
    <nav className="flex-1 overflow-y-auto p-2">
      <ul className="space-y-1">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          text="Dashboard" 
          to="/"
          active={location.pathname === '/'} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<Building size={20} />} 
          text="Clients" 
          to="/clients"
          active={location.pathname === '/clients'} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<RecruitersIcon size={20} />} 
          text="Recruiters" 
          to="/recruiters"
          active={location.pathname === '/recruiters'} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<Briefcase size={20} />} 
          text="Positions" 
          to="/positions"
          active={location.pathname === '/positions'} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<Users size={20} />} 
          text="Candidates" 
          to="/candidates"
          active={location.pathname === '/candidates'} 
          collapsed={collapsed} 
        />
        <NavItem 
          icon={<FileText size={20} />} 
          text="Reports" 
          to="/reports"
          active={location.pathname === '/reports'} 
          collapsed={collapsed} 
        />
        {isSuperAdmin && (
          <NavItem 
            icon={<Shield size={20} />} 
            text="Admin Panel" 
            to="/admin"
            active={location.pathname === '/admin'} 
            collapsed={collapsed} 
          />
        )}
        <NavItem 
          icon={<Settings size={20} />} 
          text="Settings" 
          to="/settings"
          active={location.pathname === '/settings'} 
          collapsed={collapsed} 
        />
        <li>
          <button
            onClick={onLogoutClick}
            className={cn(
              "flex items-center w-full p-2 rounded-md transition-colors duration-200",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "justify-center" : ""
            )}
          >
            <span className="flex-shrink-0"><LogOut size={20} /></span>
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
