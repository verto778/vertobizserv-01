
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Position } from '@/types/position';
import { toast } from '@/hooks/use-toast';

export const usePositionManagement = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load positions from Supabase on component mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch positions with their associated client data using a more compatible approach
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select(`
          id, 
          name, 
          is_active, 
          user_id, 
          client_id,
          clients!positions_client_id_fkey (
            id,
            company_name
          )
        `)
        .order('name', { ascending: true });

      if (positionsError) {
        // If the above query fails due to missing column, fall back to basic query
        console.log('Falling back to basic query:', positionsError);
        const { data: basicPositionsData, error: basicError } = await supabase
          .from('positions')
          .select('id, name, is_active, user_id')
          .order('name', { ascending: true });

        if (basicError) {
          throw basicError;
        }

        if (basicPositionsData) {
          const mappedData = basicPositionsData.map(position => ({
            id: position.id,
            name: position.name,
            isActive: position.is_active,
            clientId: '',
            clientName: 'No Client'
          }));
          setPositions(mappedData);
        }
        return;
      }

      if (positionsData) {
        const mappedData = positionsData.map((position: any) => ({
          id: position.id,
          name: position.name,
          isActive: position.is_active,
          clientId: position.client_id || '',
          clientName: position.clients?.company_name || 'No Client'
        }));
        setPositions(mappedData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading positions",
        description: error.message || "Failed to load positions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPosition = async (name: string, clientId: string) => {
    try {
      // Get the current user's ID from the Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to add positions",
          variant: "destructive",
        });
        return;
      }
      
      const user_id = session.user.id;
      
      // Get client name for the position
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId)
        .single();

      if (clientError || !clientData) {
        throw new Error('Failed to fetch client information');
      }
      
      // Insert the new position with explicit type casting to avoid TypeScript issues
      const insertPayload = { 
        name, 
        is_active: true, 
        user_id,
        client_id: clientId
      };

      const { data: insertData, error: insertError } = await supabase
        .from('positions')
        .insert([insertPayload])
        .select('id, name, is_active')
        .single();

      if (insertError) {
        throw insertError;
      }

      if (insertData) {
        const newPosition: Position = {
          id: insertData.id,
          name: insertData.name,
          isActive: insertData.is_active,
          clientId: clientId,
          clientName: clientData.company_name
        };
        setPositions([...positions, newPosition]);
        toast({
          title: "Success",
          description: "Position added successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding position",
        description: error.message || "Failed to add position",
        variant: "destructive",
      });
    }
  };

  const handleEditPosition = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('positions')
        .update({ 
          name
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPositions(positions.map(position => 
        position.id === id ? { ...position, name } : position
      ));
      
      toast({
        title: "Success",
        description: "Position updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating position",
        description: error.message || "Failed to update position",
        variant: "destructive",
      });
    }
  };

  const handleDeletePosition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPositions(positions.filter(position => position.id !== id));
      
      toast({
        title: "Success",
        description: "Position deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting position",
        description: error.message || "Failed to delete position",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      // First, find the position and get its current status
      const position = positions.find(pos => pos.id === id);
      if (!position) return;

      // Toggle the status in the database
      const { error } = await supabase
        .from('positions')
        .update({ 
          is_active: !position.isActive
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setPositions(positions.map(position =>
        position.id === id ? { ...position, isActive: !position.isActive } : position
      ));
      
      toast({
        title: "Success",
        description: `Position ${position.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating position status",
        description: error.message || "Failed to update position status",
        variant: "destructive",
      });
    }
  };

  return {
    positions,
    isLoading,
    handleAddPosition,
    handleEditPosition,
    handleDeletePosition,
    handleToggleStatus
  };
};
