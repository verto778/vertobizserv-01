
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Mail, User, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PersonalInfoSectionProps {
  name: string;
  contactNumber: string;
  email: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  requiredFieldErrors?: {
    name?: string;
    email?: string;
    contactNumber?: string;
  };
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  name,
  contactNumber,
  email,
  handleInputChange,
  requiredFieldErrors = {}
}) => {
  const [emailValidated, setEmailValidated] = useState(true);

  const validateEmail = (email: string) => {
    if (!email) return true;
    // No longer checking specifically for @gmail.com
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const isValid = validateEmail(e.target.value);
    setEmailValidated(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">
            Candidate Name<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="name"
              name="name"
              value={name}
              onChange={handleInputChange}
              placeholder="Enter candidate name"
              className={`pl-10 border-gray-300 bg-white ${requiredFieldErrors.name ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {requiredFieldErrors.name && (
            <p className="text-sm text-red-500 mt-1">{requiredFieldErrors.name}</p>
          )}
        </div>
        
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">
            Email<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              placeholder="Enter candidate email"
              className={`pl-10 border-gray-300 bg-white ${(!emailValidated || requiredFieldErrors.email) ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {!emailValidated && (
            <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
          )}
          {requiredFieldErrors.email && emailValidated && (
            <p className="text-sm text-red-500 mt-1">{requiredFieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1.5">
            Phone Number<span className="text-red-500 ml-1">*</span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="contactNumber"
              name="contactNumber"
              value={contactNumber}
              onChange={handleInputChange}
              required
              placeholder="+919876543210"
              className={`pl-10 border-gray-300 bg-white ${requiredFieldErrors.contactNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {requiredFieldErrors.contactNumber && (
            <p className="text-sm text-red-500 mt-1">{requiredFieldErrors.contactNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
