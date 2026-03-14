
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
        
        // Use exact counts via count queries to avoid 1000-row pagination limits
        // Filter by interview_date (consistent with reports) instead of created_at
        
        // Total candidates count
        let totalQuery = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true });
        if (dateFilter) {
          totalQuery = totalQuery.gte('interview_date', dateFilter);
        }
        
        // Not Interested count
        let niQuery = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('status1', 'Not Interested');
        if (dateFilter) {
          niQuery = niQuery.gte('interview_date', dateFilter);
        }
        
        // Interview Pending count (multiple statuses)
        let pendingQuery = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .in('status1', ['Yet to Confirm', 'Not Attended', 'Reschedule', 'Client Conf Pending']);
        if (dateFilter) {
          pendingQuery = pendingQuery.gte('interview_date', dateFilter);
        }
        
        // Feedback Awaited - status1
        let feedbackQuery1 = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('status1', 'Feedback Awaited');
        if (dateFilter) {
          feedbackQuery1 = feedbackQuery1.gte('interview_date', dateFilter);
        }
        
        // Feedback Awaited - status2
        let feedbackQuery2 = supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('status2', 'Feedback Awaited');
        if (dateFilter) {
          feedbackQuery2 = feedbackQuery2.gte('interview_date', dateFilter);
        }
        
        // Run all count queries in parallel
        const [totalResult, niResult, pendingResult, fb1Result, fb2Result] = await Promise.all([
          totalQuery,
          niQuery,
          pendingQuery,
          feedbackQuery1,
          feedbackQuery2
        ]);
        
        if (totalResult.error) throw totalResult.error;
        if (niResult.error) throw niResult.error;
        if (pendingResult.error) throw pendingResult.error;
        if (fb1Result.error) throw fb1Result.error;
        if (fb2Result.error) throw fb2Result.error;
        
        // For feedback awaited, we need to get unique IDs to avoid double-counting
        // Since count queries can't deduplicate across two columns, fetch IDs for feedback
        let fb1IdsQuery = supabase.from('candidates').select('id').eq('status1', 'Feedback Awaited');
        let fb2IdsQuery = supabase.from('candidates').select('id').eq('status2', 'Feedback Awaited');
        if (dateFilter) {
          fb1IdsQuery = fb1IdsQuery.gte('interview_date', dateFilter);
          fb2IdsQuery = fb2IdsQuery.gte('interview_date', dateFilter);
        }
        
        const [{ data: fb1Ids }, { data: fb2Ids }] = await Promise.all([fb1IdsQuery, fb2IdsQuery]);
        const feedbackIds = new Set([
          ...(fb1Ids?.map(c => c.id) || []),
          ...(fb2Ids?.map(c => c.id) || [])
        ]);
        
        console.log('Dashboard Stats - Total candidates:', totalResult.count);
        console.log('Dashboard Stats - Not Interested:', niResult.count);
        console.log('Dashboard Stats - Interview Pending:', pendingResult.count);
        console.log('Dashboard Stats - Feedback Awaited (deduplicated):', feedbackIds.size);
        
        setStatistics({
          totalCandidates: totalResult.count || 0,
          notInterested: niResult.count || 0,
          interviewPending: pendingResult.count || 0,
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
