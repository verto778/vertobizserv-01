
import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  collapsed: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ collapsed }) => {
  return (
    <div className={cn(
      "border-t p-4 flex items-center border-sidebar-border",
      collapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
          <span className="text-sm font-medium text-sidebar-accent-foreground">A</span>
        </div>
        {!collapsed && (
          <div className="ml-2">
            <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-sidebar-foreground/70">Recruiter</p>
          </div>
        )}
      </div>
      {!collapsed && (
        <button className="p-1 rounded-md hover:bg-sidebar-accent">
          <Settings size={16} className="text-sidebar-foreground" />
        </button>
      )}
    </div>
  );
};

export default SidebarFooter;
