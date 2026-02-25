
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FlowStep = 'email-input' | 'password-reset';

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('email-input');
  const [validatedUserId, setValidatedUserId] = useState<string>('');

  const resetForm = () => {
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentStep('email-input');
    setValidatedUserId('');
  };

  const checkUserExists = async (email: string): Promise<{ exists: boolean; userId?: string }> => {
    try {
      console.log('Checking if user exists:', email);
      
      // Edge function disabled temporarily
      // const { data, error } = await supabase.functions.invoke('check-user-exists-rpc', {
      //   body: { user_email: email }
      // });
      const data = null;
      const error = null;

      if (error) {
        console.error('Function error:', error);
        return await checkUserExistsFallback(email);
      }

      if (!data) {
        console.error('No data returned from function');
        return await checkUserExistsFallback(email);
      }

      return { exists: data.exists || false, userId: data.user_id };
    } catch (error) {
      console.error('Error checking user:', error);
      return await checkUserExistsFallback(email);
    }
  };

  const checkUserExistsFallback = async (email: string): Promise<{ exists: boolean; userId?: string }> => {
    try {
      // Try to sign in with a dummy password to check if user exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check-12345'
      });
      
      // If we get "Invalid login credentials", the user exists
      if (error && error.message.includes('Invalid login credentials')) {
        return { exists: true };
      }
      
      // Any other error likely means user doesn't exist
      return { exists: false };
    } catch (error) {
      console.error('Fallback check failed:', error);
      return { exists: false };
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);

    try {
      const { exists, userId } = await checkUserExists(email);
      
      if (!exists) {
        toast({
          title: "Email not registered",
          description: "This email is not registered in our system.",
          variant: "destructive",
        });
        return;
      }

      console.log('User found, proceeding to password reset');
      
      if (userId) {
        setValidatedUserId(userId);
      }
      
      toast({
        title: "Email verified",
        description: "Please enter your new password below.",
      });
      
      setCurrentStep('password-reset');
      
    } catch (error: any) {
      console.error('Email validation failed:', error);
      toast({
        title: "Verification error",
        description: "Unable to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Updating password for user:', email);
      
      // Edge function disabled temporarily
      // const { data, error } = await supabase.functions.invoke('admin-update-password-rpc', {
      //   body: { target_email: email, new_password: newPassword }
      // });
      const data = null;
      const error = new Error('Edge functions are temporarily disabled');

      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed. You can now log in with your new password.",
      });
      
      resetForm();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Password update failed:', error);
      
      let errorMessage = "Please try again later.";
      
      if (error.message?.includes('not authorized') || error.message?.includes('permission')) {
        errorMessage = "Not authorized to update password. Please contact support.";
      } else if (error.message?.includes('rate limit')) {
        errorMessage = "Too many attempts. Please wait before trying again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBackToEmail = () => {
    setCurrentStep('email-input');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'email-input' ? 'Reset your password' : 'Set new password'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'email-input' 
              ? 'Enter your registered email address to verify your account.'
              : `Enter your new password for ${email}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        {currentStep === 'email-input' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email address"
                required
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
                className="flex-1"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
