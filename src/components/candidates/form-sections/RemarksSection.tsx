
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface RemarksSectionProps {
  remarks: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const RemarksSection: React.FC<RemarksSectionProps> = ({
  remarks,
  handleInputChange,
}) => {
  return (
    <div className="space-y-2">
      <Textarea
        id="remarks"
        name="remarks"
        placeholder="Optional comments or notes about the candidate..."
        value={remarks}
        onChange={handleInputChange}
        rows={3}
        className="resize-none"
      />
    </div>
  );
};

export default RemarksSection;
