
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  
  // Parse the current hour and minute from the value
  const [hour, minute] = value ? value.split(':') : ['10', '00'];
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleTimeSelect = (h: string, m: string) => {
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={toggleDropdown}
        className={cn("w-full flex justify-between items-center", className)}
      >
        <span>{hour}:{minute}</span>
        <Clock className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-background border border-gray-200 shadow-lg rounded-md w-full overflow-hidden">
          <div className="flex">
            {/* Hours column */}
            <div className="w-1/2 border-r border-gray-200 max-h-[200px] overflow-y-auto">
              {hours.map((h) => (
                <div
                  key={h}
                  className={cn(
                    "px-4 py-2 hover:bg-muted cursor-pointer text-center",
                    h === hour && "bg-muted"
                  )}
                  onClick={() => handleTimeSelect(h, minute)}
                >
                  {h}
                </div>
              ))}
            </div>
            
            {/* Minutes column */}
            <div className="w-1/2 max-h-[200px] overflow-y-auto">
              {minutes.map((m) => (
                <div
                  key={m}
                  className={cn(
                    "px-4 py-2 hover:bg-muted cursor-pointer text-center",
                    m === minute && "bg-muted"
                  )}
                  onClick={() => handleTimeSelect(hour, m)}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
