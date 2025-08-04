
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle } from 'lucide-react';
import { Candidate } from '../types';
import { toast } from '@/hooks/use-toast';
import { status1Options, status2Options } from '../formOptions';

interface StatusSectionProps {
  status1: string;
  status2: string;
  handleSelectChange: (name: string, value: string) => void;
  showStatus1?: boolean;
  showStatus2?: boolean;
  candidate?: Candidate;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  status1,
  status2,
  handleSelectChange,
  showStatus1 = true,
  showStatus2 = true,
}) => {
  // Check if status1 is valid to enable status2
  const isStatus2Enabled = status1 && status1 !== 'choose_status1';

  // Custom handler for status1 changes - just update the form, don't send email yet
  const handleStatus1Change = (value: string) => {
    handleSelectChange('status1', value);
    
    // Just show a toast for status change, email will be sent when form is saved
    if (value === 'Confirmed') {
      toast({
        title: "Status Updated",
        description: "Status set to Confirmed. Email will be sent when you save the candidate.",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Status updated to ${value}`,
      });
    }
  };

  // Helper function to get display value for status2
  const getStatus2DisplayValue = () => {
    if (!status2 || status2 === 'choose_status2') {
      return '';
    }
    return status2;
  };

  // Helper function to get placeholder text for status2
  const getStatus2Placeholder = () => {
    if (!isStatus2Enabled) {
      return "Select Status 1 first";
    }
    return "Choose Status 2";
  };

  return (
    <>
      {showStatus1 && (
        <div className="relative">
          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select 
            value={status1 === 'choose_status1' ? '' : status1} 
            onValueChange={handleStatus1Change}
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Choose Status 1" />
            </SelectTrigger>
            <SelectContent>
              {status1Options.slice(1).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {showStatus2 && (
        <div className="relative">
          <XCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select 
            value={getStatus2DisplayValue()}
            onValueChange={(value) => handleSelectChange('status2', value)}
            disabled={!isStatus2Enabled}
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder={getStatus2Placeholder()} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {status2Options.slice(1).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default StatusSection;
