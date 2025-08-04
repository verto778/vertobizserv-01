
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ClientExtended } from '@/types/client-extended';

interface ClientFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (client: Omit<ClientExtended, 'id'>) => void;
  initialData?: ClientExtended;
  isEditing: boolean;
}

export const ClientFormDialog = ({
  open,
  setOpen,
  onSubmit,
  initialData,
  isEditing
}: ClientFormDialogProps) => {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    recruiterName: initialData?.recruiterName || '',
    position: initialData?.position || '',
    email: initialData?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form when dialog is opened/closed or when editing state changes
  React.useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        companyName: initialData.companyName,
        recruiterName: initialData.recruiterName,
        position: initialData.position,
        email: initialData.email,
      });
    } else {
      setFormData({
        companyName: '',
        recruiterName: '',
        position: '',
        email: '',
      });
    }
  }, [initialData, isEditing, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("User not authenticated");

      if (isEditing && initialData) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            company_name: formData.companyName,
            recruiter_name: formData.recruiterName,
            position: formData.position,
            email: formData.email
          })
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // Add new client
        const { error } = await supabase
          .from('clients')
          .insert({
            company_name: formData.companyName,
            recruiter_name: formData.recruiterName,
            position: formData.position,
            email: formData.email,
            name: formData.companyName, // Use company name as the name field
            is_active: true,
            user_id: userId
          });

        if (error) throw error;
      }

      // Call onSubmit to update local state
      onSubmit(formData);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recruiterName">Recruiter Name</Label>
            <Input
              id="recruiterName"
              name="recruiterName"
              value={formData.recruiterName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
              placeholder="Enter position"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'} Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
