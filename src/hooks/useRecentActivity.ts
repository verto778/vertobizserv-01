
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO, isValid, subDays } from 'date-fns';

export interface Activity {
  type: 'candidate' | 'client' | 'interview' | 'status' | 'recruiter' | 'position';
  message: string;
  time: string;
  timeDisplay: string;
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true);
      const recentActivities: Activity[] = [];
      
      // Get cutoff date for recent activities (last 7 days for better visibility)
      const cutoffDate = subDays(new Date(), 7).toISOString();
      
      console.log('Fetching recent activities since:', cutoffDate);
      
      // Fetch recently added candidates
      const { data: recentCandidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('name, created_at, updated_at, status1, status2')
        .not('name', 'is', null)
        .not('name', 'eq', '')
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
      } else if (recentCandidates?.length) {
        console.log('Recent candidates found:', recentCandidates.length);
        
        recentCandidates.forEach(candidate => {
          if (candidate.created_at && candidate.name) {
            try {
              const createdAt = parseISO(candidate.created_at);
              if (isValid(createdAt)) {
                recentActivities.push({
                  type: 'candidate',
                  message: `New candidate added: ${candidate.name}`,
                  time: candidate.created_at,
                  timeDisplay: formatDistanceToNow(createdAt, { addSuffix: true })
                });
              }
            } catch (error) {
              console.warn('Error parsing candidate date:', error);
            }
          }
        });
      }
      
      // Fetch recently added clients
      const { data: recentClients, error: clientsError } = await supabase
        .from('clients')
        .select('name, company_name, created_at')
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else if (recentClients?.length) {
        console.log('Recent clients found:', recentClients.length);
        
        recentClients.forEach(client => {
          if (client.created_at) {
            try {
              const createdAt = parseISO(client.created_at);
              if (isValid(createdAt)) {
                const clientName = client.company_name || client.name || 'Unknown Client';
                recentActivities.push({
                  type: 'client',
                  message: `New client added: ${clientName}`,
                  time: client.created_at,
                  timeDisplay: formatDistanceToNow(createdAt, { addSuffix: true })
                });
              }
            } catch (error) {
              console.warn('Error parsing client date:', error);
            }
          }
        });
      }
      
      // Fetch recently added recruiters
      const { data: recentRecruiters, error: recruitersError } = await supabase
        .from('recruiters')
        .select('name, created_at')
        .not('name', 'is', null)
        .not('name', 'eq', '')
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (recruitersError) {
        console.error('Error fetching recruiters:', recruitersError);
      } else if (recentRecruiters?.length) {
        console.log('Recent recruiters found:', recentRecruiters.length);
        
        recentRecruiters.forEach(recruiter => {
          if (recruiter.created_at && recruiter.name) {
            try {
              const createdAt = parseISO(recruiter.created_at);
              if (isValid(createdAt)) {
                recentActivities.push({
                  type: 'recruiter',
                  message: `New recruiter added: ${recruiter.name}`,
                  time: recruiter.created_at,
                  timeDisplay: formatDistanceToNow(createdAt, { addSuffix: true })
                });
              }
            } catch (error) {
              console.warn('Error parsing recruiter date:', error);
            }
          }
        });
      }

      // Fetch recently added positions
      const { data: recentPositions, error: positionsError } = await supabase
        .from('positions')
        .select('name, created_at')
        .not('name', 'is', null)
        .not('name', 'eq', '')
        .gte('created_at', cutoffDate)
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (positionsError) {
        console.error('Error fetching positions:', positionsError);
      } else if (recentPositions?.length) {
        console.log('Recent positions found:', recentPositions.length);
        
        recentPositions.forEach(position => {
          if (position.created_at && position.name) {
            try {
              const createdAt = parseISO(position.created_at);
              if (isValid(createdAt)) {
                recentActivities.push({
                  type: 'position',
                  message: `New position added: ${position.name}`,
                  time: position.created_at,
                  timeDisplay: formatDistanceToNow(createdAt, { addSuffix: true })
                });
              }
            } catch (error) {
              console.warn('Error parsing position date:', error);
            }
          }
        });
      }
      
      // Fetch recently updated candidates (status changes)
      const { data: updatedCandidates, error: updatedError } = await supabase
        .from('candidates')
        .select('name, updated_at, created_at, status1, status2')
        .not('name', 'is', null)
        .not('name', 'eq', '')
        .not('updated_at', 'is', null)
        .gte('updated_at', cutoffDate)
        .order('updated_at', { ascending: false })
        .limit(15);
          
      if (updatedError) {
        console.error('Error fetching updated candidates:', updatedError);
      } else if (updatedCandidates?.length) {
        console.log('Updated candidates found:', updatedCandidates.length);
        
        updatedCandidates.forEach(candidate => {
          if (candidate.updated_at && candidate.name && candidate.created_at) {
            try {
              const updatedAt = parseISO(candidate.updated_at);
              const createdAt = parseISO(candidate.created_at);
              
              // Only include if updated significantly after creation (more than 5 minutes)
              const timeDifference = updatedAt.getTime() - createdAt.getTime();
              const fiveMinutes = 5 * 60 * 1000;
              
              if (isValid(updatedAt) && timeDifference > fiveMinutes) {
                let statusMessage = 'Profile updated';
                if (candidate.status2 && candidate.status2 !== 'choose_status2') {
                  statusMessage = `Status changed to: ${candidate.status2}`;
                } else if (candidate.status1 && candidate.status1 !== 'choose_status1') {
                  statusMessage = `Interview status: ${candidate.status1}`;
                }
                
                recentActivities.push({
                  type: 'status',
                  message: `${candidate.name} - ${statusMessage}`,
                  time: candidate.updated_at,
                  timeDisplay: formatDistanceToNow(updatedAt, { addSuffix: true })
                });
              }
            } catch (error) {
              console.warn('Error parsing updated candidate date:', error);
            }
          }
        });
      }
      
      // Sort all activities by time (most recent first)
      recentActivities.sort((a, b) => {
        try {
          const timeA = parseISO(a.time);
          const timeB = parseISO(b.time);
          return timeB.getTime() - timeA.getTime();
        } catch (error) {
          console.warn('Error sorting activities:', error);
          return 0;
        }
      });
      
      console.log('Total activities found:', recentActivities.length);
      
      // Limit to top 15 most recent activities
      setActivities(recentActivities.slice(0, 15));
    } catch (error: any) {
      console.error('Error loading recent activities:', error);
      toast({
        title: "Error loading activities",
        description: error.message || "Failed to load recent activities",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();

    // Set up real-time subscriptions for immediate updates
    const candidatesChannel = supabase
      .channel('candidates-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'candidates' }, 
        (payload) => {
          console.log('New candidate detected:', payload);
          fetchRecentActivities();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'candidates' }, 
        (payload) => {
          console.log('Candidate updated:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    const clientsChannel = supabase
      .channel('clients-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'clients' }, 
        (payload) => {
          console.log('New client detected:', payload);
          fetchRecentActivities();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'clients' }, 
        (payload) => {
          console.log('Client updated:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    const recruitersChannel = supabase
      .channel('recruiters-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'recruiters' }, 
        (payload) => {
          console.log('New recruiter detected:', payload);
          fetchRecentActivities();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'recruiters' }, 
        (payload) => {
          console.log('Recruiter updated:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    const positionsChannel = supabase
      .channel('positions-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'positions' }, 
        (payload) => {
          console.log('New position detected:', payload);
          fetchRecentActivities();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'positions' }, 
        (payload) => {
          console.log('Position updated:', payload);
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(recruitersChannel);
      supabase.removeChannel(positionsChannel);
    };
  }, []);

  return {
    activities,
    isLoading
  };
};
