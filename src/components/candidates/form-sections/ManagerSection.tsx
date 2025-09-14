import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import { useManagers } from '@/hooks/useManagers';

interface ManagerSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ManagerSection = ({ 
  value, 
  onChange, 
  placeholder = "Select a manager" 
}: ManagerSectionProps) => {
  const { managers, isLoading } = useManagers(true);
  const [sortAlphabetically, setSortAlphabetically] = useState(true);

  const sortedManagers = sortAlphabetically 
    ? [...managers].sort((a, b) => a.name.localeCompare(b.name))
    : managers;

  // Since we're using names directly in the candidate form, we need to handle name-based selection
  const selectedManager = managers.find(manager => manager.name === value);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder}>
            {value || placeholder}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading managers...
            </SelectItem>
          ) : sortedManagers.length === 0 ? (
            <SelectItem value="no-managers" disabled>
              No active managers found
            </SelectItem>
          ) : (
            <>
              <SelectItem value="">
                <span className="text-muted-foreground">No manager selected</span>
              </SelectItem>
              {sortedManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.name}>
                  {manager.name}
                </SelectItem>
              ))}
            </>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};