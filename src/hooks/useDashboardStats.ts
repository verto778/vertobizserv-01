
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalCandidates: number;
  notInterested: number; 
  interviewPending: number;
  feedbackAwaited: number;
}

export const useDashboardStats = (timePeriod?: string) => {
  const [statistics, setStatistics] = useState<DashboardStats>({
    totalCandidates: 0,
    notInterested: 0, 
    interviewPending: 0,
    feedbackAwaited: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date filter if timePeriod is provided
        let dateFilter = null;
        if (timePeriod) {
          const today = new Date();
          const daysAgo = parseInt(timePeriod.replace('-entire', ''));
          const pastDate = new Date();
          pastDate.setDate(today.getDate() - daysAgo);
          dateFilter = pastDate.toISOString();
        }
        
        // Get all candidates count with date filter
        let totalQuery = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true });
        
        if (dateFilter) {
          totalQuery = totalQuery.gte('created_at', dateFilter);
        }
        
        const { count: totalCount, error: totalError } = await totalQuery;
        if (totalError) throw totalError;
        
        // Get ONLY "Not Interested" candidates - fix the issue by being specific
        let niQuery = supabase
          .from('candidates')
          .select('id')
          .eq('status1', 'Not Interested');
        
        if (dateFilter) {
          niQuery = niQuery.gte('created_at', dateFilter);
        }
        
        const { data: notInterestedData, error: niError } = await niQuery;
        if (niError) throw niError;
        
        // Get "interview pending" candidates - updated to include all requested statuses
        let pendingQuery = supabase
          .from('candidates')
          .select('id, status1')
          .in('status1', ['Yet to Confirm', 'Not Attended', 'Reschedule', 'Client Conf Pending']);
        
        if (dateFilter) {
          pendingQuery = pendingQuery.gte('created_at', dateFilter);
        }
        
        const { data: pendingData, error: pendingError } = await pendingQuery;
        if (pendingError) throw pendingError;
        
        // Get feedback awaited candidates - check both status1 and status2
        let feedbackQuery1 = supabase
          .from('candidates')
          .select('id')
          .eq('status1', 'Feedback Awaited');
        
        let feedbackQuery2 = supabase
          .from('candidates')
          .select('id')
          .eq('status2', 'Feedback Awaited');
        
        if (dateFilter) {
          feedbackQuery1 = feedbackQuery1.gte('created_at', dateFilter);
          feedbackQuery2 = feedbackQuery2.gte('created_at', dateFilter);
        }
        
        const [{ data: feedbackData1, error: feedbackError1 }, { data: feedbackData2, error: feedbackError2 }] = await Promise.all([
          feedbackQuery1,
          feedbackQuery2
        ]);
        
        if (feedbackError1) throw feedbackError1;
        if (feedbackError2) throw feedbackError2;
        
        // Combine and deduplicate feedback awaited candidates
        const feedbackIds = new Set([
          ...(feedbackData1?.map(c => c.id) || []),
          ...(feedbackData2?.map(c => c.id) || [])
        ]);
        
        console.log('Dashboard Stats - Total candidates:', totalCount);
        console.log('Dashboard Stats - Not Interested (only):', notInterestedData?.length);
        console.log('Dashboard Stats - Interview Pending (Yet to Confirm, Not Attended, Reschedule, Client Conf Pending):', pendingData?.length);
        console.log('Dashboard Stats - Feedback Awaited (status1):', feedbackData1?.length);
        console.log('Dashboard Stats - Feedback Awaited (status2):', feedbackData2?.length);
        console.log('Dashboard Stats - Feedback Awaited (combined):', feedbackIds.size);
        
        setStatistics({
          totalCandidates: totalCount || 0,
          notInterested: notInterestedData?.length || 0,
          interviewPending: pendingData?.length || 0,
          feedbackAwaited: feedbackIds.size || 0
        });
      } catch (error: any) {
        console.error('Error loading dashboard stats:', error);
        toast({
          title: "Error loading dashboard statistics",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [timePeriod]);

  return {
    statistics,
    isLoading
  };
};
