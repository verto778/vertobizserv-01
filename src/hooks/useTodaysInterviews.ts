
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, startOfToday, endOfToday } from 'date-fns';

export interface TodayInterview {
  candidate: string;
  mobile: string;
  client: string;
  position: string;
  recruiter: string;
  time: string;
  mode: string;
  status1: string;
}

export const useTodaysInterviews = () => {
  const [interviews, setInterviews] = useState<TodayInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysInterviews = async () => {
      try {
        setIsLoading(true);
        
        const today = new Date();
        const todayStart = startOfToday().toISOString();
        const todayEnd = endOfToday().toISOString();
        
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .gte('interview_date', todayStart)
          .lte('interview_date', todayEnd)
          .not('interview_date', 'is', null);

        if (error) throw error;
        
        if (data) {
          const formattedInterviews = data
            .filter(candidate => {
              // Additional safety check to ensure interview_date is valid
              if (!candidate.interview_date) return false;
              
              const interviewDate = new Date(candidate.interview_date);
              return !isNaN(interviewDate.getTime());
            })
            .map(candidate => ({
              candidate: candidate.name || 'N/A',
              mobile: candidate.contact_number || 'N/A',
              client: candidate.client_name || 'N/A',
              position: candidate.position || 'N/A',
              recruiter: candidate.recruiter_name || 'N/A',
              time: candidate.interview_time || 'N/A',
              mode: candidate.interview_mode || 'N/A',
              status1: candidate.status1 || 'Pending'
            }));
          
          setInterviews(formattedInterviews);
        }
      } catch (error: any) {
        console.error('Error loading today\'s interviews:', error);
        toast({
          title: "Error loading interviews",
          description: error.message || "Failed to load today's interviews",
          variant: "destructive"
        });
        // Set empty array on error to prevent rendering issues
        setInterviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysInterviews();
  }, []);

  return {
    interviews,
    isLoading
  };
};
