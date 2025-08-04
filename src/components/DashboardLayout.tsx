
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-200 ease-in-out",
          collapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
