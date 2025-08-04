
import React, { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import DateSelectField from '../DateSelectField';
import { User } from 'lucide-react';
import { useRecruiters } from '@/hooks/useRecruiters';

interface RecruiterSectionProps {
  recruiterName: string;
  dateInformed: Date;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  setDateInformed: (date: Date | undefined) => void;
  showRecruiter?: boolean;
  showDateInformed?: boolean;
}

const RecruiterSection: React.FC<RecruiterSectionProps> = ({ 
  recruiterName, 
  dateInformed,
  handleInputChange,
  handleSelectChange,
  setDateInformed,
  showRecruiter = true,
  showDateInformed = true
}) => {
  // Always fetch recruiters if showRecruiter is true OR if we have a recruiterName (for edit mode)
  const shouldFetchRecruiters = showRecruiter || !!recruiterName;
  const { recruiters, isLoading } = useRecruiters(shouldFetchRecruiters);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // Debug log to track recruiter value changes
  useEffect(() => {
    console.log("RecruiterSection - recruiterName:", recruiterName, "recruiters loaded:", recruiters.length, "shouldFetch:", shouldFetchRecruiters);
  }, [recruiterName, recruiters, shouldFetchRecruiters]);

  // Sort recruiters based on the toggle state
  const sortedRecruiters = useMemo(() => {
    if (!sortAlphabetically) return recruiters;
    
    return [...recruiters].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }, [recruiters, sortAlphabetically]);

  // FIXED: Ensure the value is properly preserved and displayed
  const selectValue = recruiterName && recruiterName.trim() !== '' ? recruiterName : '';

  return (
    <>
      {showRecruiter && (
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select 
            value={selectValue}
            onValueChange={(value) => handleSelectChange('recruiterName', value)}
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select Recruiter">
                {selectValue || undefined}
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
                      {/* Show saved recruiter value first if it exists and is not in the regular options */}
                      {selectValue && !recruiters.find(r => r.name === selectValue) && (
                        <SelectItem key={`saved-${selectValue}`} value={selectValue}>
                          {selectValue} (saved)
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
      )}
      
      {showDateInformed && (
        <DateSelectField
          selectedDate={dateInformed}
          onDateChange={(date) => date && setDateInformed(date)}
          placeholder="Select date informed"
        />
      )}
    </>
  );
};

export default RecruiterSection;
