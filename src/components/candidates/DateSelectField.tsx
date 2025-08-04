
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';

interface DateSelectFieldProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  className?: string;
  showCalendarIcon?: boolean;
  placeholder?: string;
}

const DateSelectField: React.FC<DateSelectFieldProps> = ({ 
  selectedDate, 
  onDateChange,
  label,
  className,
  showCalendarIcon = true,
  placeholder = "Select date"
}) => {
  const formattedDate = selectedDate ? format(selectedDate, 'MMMM do, yyyy') : placeholder;

  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium text-gray-700 mb-1.5">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border border-gray-300 bg-white hover:bg-gray-50",
              !selectedDate && "text-gray-500",
              className
            )}
          >
            {showCalendarIcon && (
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            )}
            {formattedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelectField;
