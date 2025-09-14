import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Manager } from '@/types/manager';

export const useManagers = (showManager = true) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active managers from localStorage
  useEffect(() => {
    const fetchActiveManagers = async () => {
      if (!showManager) return;
      
      try {
        setIsLoading(true);
        const savedManagers = localStorage.getItem('managers');
        if (savedManagers) {
          const allManagers = JSON.parse(savedManagers);
          const activeManagers = allManagers.filter((mgr: Manager) => mgr.isActive);
          setManagers(activeManagers);
        }
      } catch (error) {
        console.error('Error loading managers:', error);
        toast({
          title: "Error loading managers",
          description: "Could not load active managers",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveManagers();
  }, [showManager]);

  return {
    managers,
    isLoading
  };
};