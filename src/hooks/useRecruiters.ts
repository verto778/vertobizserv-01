
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Recruiter } from '@/types/recruiter';

export const useRecruiters = (showRecruiter = true) => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active recruiters from Supabase
  useEffect(() => {
    const fetchActiveRecruiters = async () => {
      if (!showRecruiter) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('recruiters')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        if (data) {
          const recruiters = data.map(rec => ({
            id: rec.id,
            name: rec.name,
            isActive: true
          }));
          setRecruiters(recruiters);
        }
      } catch (error) {
        console.error('Error loading recruiters:', error);
        toast({
          title: "Error loading recruiters",
          description: "Could not load active recruiters",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveRecruiters();
  }, [showRecruiter]);

  return {
    recruiters,
    isLoading
  };
};
