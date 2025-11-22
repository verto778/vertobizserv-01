import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { startOfToday, endOfToday } from 'date-fns';
import { Bell } from 'lucide-react';

// Convert various time formats to minutes from midnight
const timeToMinutes = (timeStr: string): number | null => {
  if (!timeStr || timeStr === 'N/A') return null;
  
  // If already in 24-hour format (HH:MM)
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }
  
  // Handle AM/PM format
  const lowerTime = timeStr.toLowerCase().trim();
  let hour = parseInt(lowerTime);
  const isAM = lowerTime.includes('am');
  const isPM = lowerTime.includes('pm');
  
  if (isNaN(hour)) return null;
  
  // Convert to 24-hour format
  if (isPM && hour !== 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }
  
  return hour * 60;
};

export const useInterviewNotifications = () => {
  const notifiedInterviewsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkUpcomingInterviews = async () => {
      try {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
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
          data.forEach(candidate => {
            if (!candidate.interview_time || !candidate.name) return;
            
            const interviewMinutes = timeToMinutes(candidate.interview_time);
            if (interviewMinutes === null) return;
            
            // Calculate time difference in minutes
            const timeDiff = interviewMinutes - currentMinutes;
            
            // Notify if interview is within 10 minutes and hasn't been notified yet
            const notificationKey = `${candidate.id}-${candidate.interview_time}`;
            
            if (timeDiff > 0 && timeDiff <= 10 && !notifiedInterviewsRef.current.has(notificationKey)) {
              notifiedInterviewsRef.current.add(notificationKey);
              
              // Show toast notification
              toast({
                title: "🔔 Upcoming Interview!",
                description: `${candidate.name}\nClient: ${candidate.client_name || 'N/A'}\nPosition: ${candidate.position || 'N/A'}\nTime: ${candidate.interview_time}\nStarting in ${Math.round(timeDiff)} minutes`,
                duration: 10000, // Show for 10 seconds
              });
              
              // Request browser notification permission and show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Upcoming Interview', {
                  body: `${candidate.name} - ${candidate.interview_time} (in ${Math.round(timeDiff)} min)`,
                  icon: '/favicon.ico',
                  tag: notificationKey,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error checking upcoming interviews:', error);
      }
    };

    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check immediately
    checkUpcomingInterviews();

    // Check every minute
    const interval = setInterval(checkUpcomingInterviews, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);
};
