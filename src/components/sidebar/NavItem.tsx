
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, active = false, collapsed }) => {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center p-2 rounded-md transition-colors duration-200",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
          collapsed ? "justify-center" : ""
        )}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && <span className="ml-3">{text}</span>}
      </Link>
    </li>
  );
};

export default NavItem;
