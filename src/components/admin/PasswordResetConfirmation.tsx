
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PasswordResetConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userEmail: string;
  isOwnPassword: boolean;
  isLoading?: boolean;
}

const PasswordResetConfirmation: React.FC<PasswordResetConfirmationProps> = ({
  open,
  onOpenChange,
  onConfirm,
  userEmail,
  isOwnPassword,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {isOwnPassword ? 'Reset Your Own Password?' : 'Reset User Password?'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {isOwnPassword ? (
              <>
                You are resetting your own password. This will log you out and you'll need to sign in again with the new password.
                <br />
                <br />
                <strong>Continue?</strong>
              </>
            ) : (
              <>
                Are you sure you want to reset the password for <strong>{userEmail}</strong>?
                <br />
                <br />
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Resetting...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetConfirmation;
