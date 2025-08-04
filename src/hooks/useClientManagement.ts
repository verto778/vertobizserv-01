
import { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Load clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, is_active');

        if (error) throw error;
        
        if (data) {
          // Map the DB fields to our Client type structure
          const mappedClients: Client[] = data.map(client => ({
            id: client.id,
            name: client.name,
            isActive: client.is_active // Map is_active to isActive
          }));
          setClients(mappedClients);
        }
      } catch (error: any) {
        toast({
          title: "Error loading clients",
          description: error.message || "Failed to load clients",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = async (clientName: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;

      const newClient = {
        name: clientName,
        is_active: true,
        user_id: userId,
        company_name: clientName, // For simplicity, using the same name for company_name
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single();

      if (error) throw error;

      // Map the returned data to our Client type
      const mappedClient: Client = {
        id: data.id,
        name: data.name,
        isActive: data.is_active
      };
      
      setClients([...clients, mappedClient]);
      
      toast({
        title: "Client added",
        description: "The client has been added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error adding client",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleEditClient = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          name: newName, 
          company_name: newName,
        })
        .eq('id', id);

      if (error) throw error;

      setClients(clients.map(client => 
        client.id === id ? { ...client, name: newName } : client
      ));
      
      toast({
        title: "Client updated",
        description: "The client has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating client",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(clients.filter(client => client.id !== id));
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting client",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const client = clients.find(client => client.id === id);
      if (!client) return;

      const newStatus = !client.isActive;

      const { error } = await supabase
        .from('clients')
        .update({ 
          is_active: newStatus,
        })
        .eq('id', id);

      if (error) throw error;

      setClients(clients.map(client =>
        client.id === id ? { ...client, isActive: newStatus } : client
      ));
      
      toast({
        title: "Client status updated",
        description: `Client is now ${newStatus ? 'active' : 'inactive'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating client status",
        description: error.message || "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  return {
    clients,
    loading,
    handleAddClient,
    handleEditClient,
    handleDeleteClient,
    handleToggleStatus
  };
};
