
import { useState, useEffect } from 'react';
import { Recruiter } from '@/types/recruiter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRecruiterManagement = () => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recruiters from Supabase
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const { data, error } = await supabase
          .from('recruiters')
          .select('id, name, is_active, created_at');

        if (error) throw error;
        
        if (data) {
          const mappedRecruiters: Recruiter[] = data.map(recruiter => ({
            id: recruiter.id,
            name: recruiter.name,
            isActive: recruiter.is_active
          }));
          setRecruiters(mappedRecruiters);
        }
      } catch (error: any) {
        toast({
          title: "Error loading recruiters",
          description: error.message || "Failed to load recruiters",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  const handleAddRecruiter = async (name: string) => {
    try {
      // First get the current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Now include user_id in the insert
      const { data, error } = await supabase
        .from('recruiters')
        .insert({ 
          name, 
          user_id: userId
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newRecruiter: Recruiter = {
          id: data[0].id,
          name: data[0].name,
          isActive: data[0].is_active
        };
        setRecruiters([...recruiters, newRecruiter]);
        
        toast({
          title: "Success",
          description: "Recruiter added successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding recruiter",
        description: error.message || "Failed to add recruiter",
        variant: "destructive",
      });
    }
  };

  const handleEditRecruiter = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('recruiters')
        .update({ 
          name
        })
        .eq('id', id);

      if (error) throw error;
      
      setRecruiters(recruiters.map(recruiter => 
        recruiter.id === id ? { ...recruiter, name } : recruiter
      ));
      
      toast({
        title: "Success",
        description: "Recruiter updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating recruiter",
        description: error.message || "Failed to update recruiter",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecruiter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recruiters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRecruiters(recruiters.filter(recruiter => recruiter.id !== id));
      
      toast({
        title: "Success",
        description: "Recruiter deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting recruiter",
        description: error.message || "Failed to delete recruiter",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      // First, find the current status to toggle it
      const recruiter = recruiters.find(r => r.id === id);
      if (!recruiter) return;
      
      const newStatus = !recruiter.isActive;
      
      const { error } = await supabase
        .from('recruiters')
        .update({ 
          is_active: newStatus
        })
        .eq('id', id);

      if (error) throw error;
      
      setRecruiters(recruiters.map(recruiter =>
        recruiter.id === id ? { ...recruiter, isActive: newStatus } : recruiter
      ));
      
      toast({
        title: "Success",
        description: `Recruiter status ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating recruiter status",
        description: error.message || "Failed to update recruiter status",
        variant: "destructive",
      });
    }
  };

  return {
    recruiters,
    loading,
    handleAddRecruiter,
    handleEditRecruiter,
    handleDeleteRecruiter,
    handleToggleStatus
  };
};
