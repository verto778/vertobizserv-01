
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useClientData } from '@/hooks/useClientData';
import { ClientHeader } from '@/components/clients/ClientHeader';
import { ClientTable } from '@/components/clients/ClientTable';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { toast } from '@/hooks/use-toast';
import { ClientExtended } from '@/types/client-extended';
import { supabase } from '@/integrations/supabase/client';

const Clients = () => {
  const { clients, setClients, searchTerm, setSearchTerm, filteredClients, loading } = useClientData();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<ClientExtended | undefined>(undefined);
  
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentClient(undefined);
    setOpen(true);
  };

  const handleEditClient = (client: ClientExtended) => {
    setIsEditing(true);
    setCurrentClient(client);
    setOpen(true);
  };

  const handleSubmit = (formData: Omit<ClientExtended, 'id'>) => {
    // This is now only used for local state updates
    // The actual database operations are handled in ClientFormDialog
    if (isEditing && currentClient) {
      // Update existing client in local state
      const updatedClients = clients.map(client => 
        client.id === currentClient.id 
          ? { ...client, ...formData }
          : client
      );
      setClients(updatedClients);
      
      toast({
        title: "Client updated",
        description: `${formData.companyName} has been updated successfully`,
      });
    } else {
      // This will be handled after the Supabase response
      // We'll fetch the clients again to ensure we have the correct data
      // with the server-generated ID
      fetchClients();
      
      toast({
        title: "Client added",
        description: `${formData.companyName} has been added successfully`,
      });
    }
    
    setOpen(false);
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, recruiter_name, position, email')
        .eq('is_active', true);

      if (error) throw error;
      
      if (data) {
        const mappedData = data.map(client => ({
          id: client.id,
          companyName: client.company_name,
          recruiterName: client.recruiter_name || '',
          position: client.position || '',
          email: client.email || ''
        }));
        
        setClients(mappedData);
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <ClientHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onAddClick={handleAddClick}
        />
        
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            Loading clients...
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ClientTable 
              clients={filteredClients} 
              onEdit={handleEditClient}
            />
            
            {clients.length > 0 && filteredClients.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No clients match your search. Try a different search term.
              </div>
            )}
            
            {clients.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No clients added yet. Add a client to get started.
              </div>
            )}
          </div>
        )}
        
        <ClientFormDialog
          open={open}
          setOpen={setOpen}
          onSubmit={handleSubmit}
          initialData={currentClient}
          isEditing={isEditing}
        />
      </div>
    </DashboardLayout>
  );
};

export default Clients;
