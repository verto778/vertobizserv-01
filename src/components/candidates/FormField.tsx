
import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  showWarning?: boolean;
  warningComponent?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  className = "space-y-2", 
  children,
  showWarning = false,
  warningComponent = null
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {showWarning && warningComponent}
    </div>
  );
};

export default FormField;
