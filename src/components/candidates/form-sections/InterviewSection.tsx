
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { interviewModeOptions, interviewRoundOptions } from '../formOptions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface InterviewSectionProps {
  interviewDate: Date | undefined;
  interviewRound: string;
  interviewMode: string;
  interviewTime?: string; // Add this prop to get the actual time from form
  setSelectedInterviewDate: (date: Date | undefined) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const InterviewSection: React.FC<InterviewSectionProps> = ({
  interviewDate,
  interviewRound,
  interviewMode,
  interviewTime = '', // Use the actual time from form data
  setSelectedInterviewDate,
  handleSelectChange,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  
  const handleTimeSelect = (time: string) => {
    console.log("Time selected:", time);
    const [hour, minute] = time.split(':');
    
    // Update the date object if we have one
    if (interviewDate) {
      const newDate = new Date(interviewDate);
      newDate.setHours(parseInt(hour, 10), parseInt(minute, 10));
      setSelectedInterviewDate(newDate);
    }
    
    // Always update the form's interviewTime field with the selected time
    handleSelectChange('interviewTime', time);
    console.log("Updated interview time to:", time);
  };

  // FIXED: Get current time from the actual form data prop, no fallback
  const currentTime = interviewTime || '';
  console.log("Current time from form data:", currentTime);
  
  // Parse current hour and minute, use '00' as fallback for display only
  const [currentHour, currentMinute] = currentTime ? currentTime.split(':') : ['00', '00'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">Interview Date</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border border-gray-300 bg-white hover:bg-gray-50",
                  !interviewDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                {interviewDate ? format(interviewDate, 'MMMM do, yyyy') : 'Select interview date (optional)'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={interviewDate}
                onSelect={(date) => setSelectedInterviewDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">Interview Time</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border border-gray-300 bg-white hover:bg-gray-50",
                  !interviewDate && "text-muted-foreground"
                )}
                disabled={!interviewDate}
              >
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                {interviewDate && currentTime ? currentTime : (interviewDate ? 'Select time' : 'Select date first')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="grid grid-cols-2 h-[200px] overflow-auto">
                <div className="border-r">
                  {hours.map((hour) => (
                    <div 
                      key={hour} 
                      className={cn(
                        "px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-center",
                        hour === currentHour && "bg-gray-100"
                      )}
                      onClick={() => handleTimeSelect(`${hour}:${currentMinute}`)}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
                <div>
                  {minutes.map((minute) => (
                    <div 
                      key={minute} 
                      className={cn(
                        "px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-center",
                        minute === currentMinute && "bg-gray-100"
                      )}
                      onClick={() => handleTimeSelect(`${currentHour}:${minute}`)}
                    >
                      {minute}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">Interview Round</div>
          <Select 
            value={interviewRound || ""} 
            onValueChange={(value) => handleSelectChange('interviewRound', value)}
          >
            <SelectTrigger className="border-gray-300 bg-white">
              <SelectValue placeholder="Choose Round" />
            </SelectTrigger>
            <SelectContent>
              {interviewRoundOptions.map((round) => (
                <SelectItem key={round.value} value={round.value}>
                  {round.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">Mode</div>
          <Select 
            value={interviewMode || ""} 
            onValueChange={(value) => handleSelectChange('interviewMode', value)}
          >
            <SelectTrigger className="border-gray-300 bg-white">
              <SelectValue placeholder="Choose Mode" />
            </SelectTrigger>
            <SelectContent>
              {interviewModeOptions.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default InterviewSection;
