
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useRecruiters } from '@/hooks/useRecruiters';

interface RecruiterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RecruiterSelect: React.FC<RecruiterSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select Recruiter" 
}) => {
  // Fetch recruiters if component is being used OR if we have a saved value (for edit case)
  const shouldFetchRecruiters = true; // Always fetch for this component
  const { recruiters, isLoading } = useRecruiters(shouldFetchRecruiters);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // Sort recruiters based on the toggle state
  const sortedRecruiters = useMemo(() => {
    if (!sortAlphabetically) return recruiters;
    
    return [...recruiters].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }, [recruiters, sortAlphabetically]);

  // FIXED: Always preserve the existing value, don't let Select component clear it
  const displayValue = value || "";

  return (
    <div className="relative">
      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Select 
        value={displayValue} 
        onValueChange={onChange}
      >
        <SelectTrigger className="pl-10">
          <SelectValue placeholder={placeholder}>
            {/* FIXED: Force display the value even if it's not in options yet */}
            {value && value.trim() !== '' ? value : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-white">
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading recruiters...</SelectItem>
          ) : (
            <>
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {recruiters.length} recruiter{recruiters.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortAlphabetically(!sortAlphabetically)}
                  className="h-6 px-2 text-xs"
                >
                  {sortAlphabetically ? 'Default' : 'A-Z'}
                </Button>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {/* FIXED: Always show saved recruiter value first if it exists and is not in the regular options */}
                  {value && value.trim() !== '' && !recruiters.find(r => r.name === value) && value !== 'no_recruiter' && (
                    <SelectItem key={`saved-${value}`} value={value}>
                      {value} (saved)
                    </SelectItem>
                  )}
                  {sortedRecruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.name}>
                      {recruiter.name}
                    </SelectItem>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RecruiterSelect;
