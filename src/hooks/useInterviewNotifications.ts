import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { startOfToday, endOfToday } from 'date-fns';

// Convert various time formats to minutes from midnight
const timeToMinutes = (timeStr: string): number | null => {
  if (!timeStr || timeStr === 'N/A') return null;
  
  const cleanTime = timeStr.trim();
  
  // If already in 24-hour format (HH:MM or H:MM)
  if (cleanTime.includes(':')) {
    const parts = cleanTime.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) {
      console.log('[Notification] Invalid time format:', timeStr);
      return null;
    }
    return hours * 60 + minutes;
  }
  
  // Handle AM/PM format (e.g., "3 PM", "11 AM", "3PM", "11AM")
  const lowerTime = cleanTime.toLowerCase();
  const timeMatch = lowerTime.match(/(\d+)\s*(am|pm)/);
  
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const isPM = timeMatch[2] === 'pm';
    
    if (isNaN(hour)) return null;
    
    // Convert to 24-hour format
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return hour * 60;
  }
  
  console.log('[Notification] Could not parse time format:', timeStr);
  return null;
};

// Play notification sound
const playNotificationSound = () => {
  try {
    // Create audio context and play a pleasant notification tone
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant bell-like sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play second tone for emphasis
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 200);
    
    console.log('[Notification] Sound played successfully');
  } catch (error) {
    console.error('[Notification] Error playing sound:', error);
  }
};

export const useInterviewNotifications = () => {
  const notifiedInterviewsRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<Date | null>(null);

  useEffect(() => {
    const checkUpcomingInterviews = async () => {
      try {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        console.log('[Notification Check] Starting check at', now.toLocaleTimeString());
        
        const todayStart = startOfToday().toISOString();
        const todayEnd = endOfToday().toISOString();
        
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .gte('interview_date', todayStart)
          .lte('interview_date', todayEnd)
          .not('interview_date', 'is', null);

        if (error) {
          console.error('[Notification] Database error:', error);
          throw error;
        }
        
        if (data) {
          console.log(`[Notification] Found ${data.length} interviews today`);
          
          let notificationCount = 0;
          
          data.forEach(candidate => {
            if (!candidate.interview_time || !candidate.name) {
              console.log('[Notification] Skipping candidate - missing time or name:', candidate.id);
              return;
            }
            
            const interviewMinutes = timeToMinutes(candidate.interview_time);
            if (interviewMinutes === null) {
              console.log('[Notification] Invalid time format:', candidate.interview_time);
              return;
            }
            
            // Calculate time difference in minutes
            const timeDiff = interviewMinutes - currentMinutes;
            
            // Notify if interview is between 9 and 10 minutes away (to catch the window reliably)
            const notificationKey = `${candidate.id}-${candidate.interview_time}-${startOfToday().toISOString()}`;
            
            console.log(`[Notification] Candidate: ${candidate.name}, Time: ${candidate.interview_time}, Interview Minutes: ${interviewMinutes}, Current Minutes: ${currentMinutes}, Diff: ${timeDiff} min, Already Notified: ${notifiedInterviewsRef.current.has(notificationKey)}`);
            
            if (timeDiff >= 9 && timeDiff <= 10 && !notifiedInterviewsRef.current.has(notificationKey)) {
              notifiedInterviewsRef.current.add(notificationKey);
              notificationCount++;
              
              console.log(`[Notification] Triggering notification for ${candidate.name}`);
              
              // Play sound
              playNotificationSound();
              
              // Show toast notification with custom styling
              toast({
                title: "🔔 UPCOMING INTERVIEW ALERT!",
                description: `${candidate.name}\nClient: ${candidate.client_name || 'N/A'}\nPosition: ${candidate.position || 'N/A'}\nTime: ${candidate.interview_time}\n⏰ Starting in ${Math.round(timeDiff)} minutes`,
                duration: 15000, // Show for 15 seconds
                className: "border-orange-500 border-2 bg-orange-50 dark:bg-orange-950"
              });
              
              // Request browser notification permission and show notification
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  const notification = new Notification('🔔 UPCOMING INTERVIEW ALERT!', {
                    body: `${candidate.name}\nClient: ${candidate.client_name || 'N/A'}\nPosition: ${candidate.position || 'N/A'}\nTime: ${candidate.interview_time}\nStarting in ${Math.round(timeDiff)} minutes`,
                    icon: '/favicon.ico',
                    tag: notificationKey,
                    requireInteraction: true, // Keeps notification visible until dismissed
                    silent: false
                  });
                  
                  // Play sound again when notification is clicked
                  notification.onclick = () => {
                    playNotificationSound();
                    window.focus();
                    notification.close();
                  };
                } else if (Notification.permission === 'default') {
                  Notification.requestPermission().then(permission => {
                    console.log('[Notification] Permission status:', permission);
                  });
                }
              }
            }
          });
          
          console.log(`[Notification] Sent ${notificationCount} notifications`);
          console.log(`[Notification] Total tracked: ${notifiedInterviewsRef.current.size}`);
        }
        
        lastCheckRef.current = now;
      } catch (error) {
        console.error('[Notification] Error checking upcoming interviews:', error);
        toast({
          title: "Notification System Error",
          description: "Failed to check for upcoming interviews. Please refresh the page.",
          variant: "destructive",
          duration: 5000
        });
      }
    };

    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('[Notification] Requesting permission...');
      Notification.requestPermission().then(permission => {
        console.log('[Notification] Permission granted:', permission);
      });
    }

    // Check immediately
    console.log('[Notification] System initialized - checking every 30 seconds');
    checkUpcomingInterviews();

    // Check every 30 seconds for more reliable notifications
    const interval = setInterval(checkUpcomingInterviews, 30000);

    // Cleanup old notifications daily (at midnight)
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedInterviewsRef.current.clear();
        console.log('[Notification] Cleared notification history');
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
      console.log('[Notification] System stopped');
    };
  }, []);
};
