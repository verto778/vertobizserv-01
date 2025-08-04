
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Position } from '@/types/position';

export const usePositions = (showPosition = true, clientId = '') => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch positions from Supabase
  useEffect(() => {
    const fetchPositions = async () => {
      if (!showPosition) {
        setPositions([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Use a simple approach to avoid TypeScript type inference issues
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (positionsError) {
          throw positionsError;
        }
        
        if (positionsData) {
          // Cast to any to bypass TypeScript issues, then filter and map
          const rawPositions = positionsData as any[];
          
          // Filter by client if clientId is provided
          const filteredPositions = clientId 
            ? rawPositions.filter(pos => pos.client_id === clientId)
            : rawPositions;
          
          const mappedPositions = filteredPositions.map((pos) => ({
            id: pos.id,
            name: pos.name,
            isActive: true,
            clientId: pos.client_id || '',
            clientName: 'Client'
          }));
          
          setPositions(mappedPositions);
        } else {
          setPositions([]);
        }
      } catch (error: any) {
        console.error('Error loading positions:', error);
        toast({
          title: "Error loading positions",
          description: "Could not load positions from database",
          variant: "destructive"
        });
        setPositions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [showPosition, clientId]);

  return {
    positions,
    isLoading
  };
};
