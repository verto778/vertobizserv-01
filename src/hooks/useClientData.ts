
import { useState, useEffect } from 'react';
import { ClientExtended } from '@/types/client-extended';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClientData = () => {
  const [clients, setClients] = useState<ClientExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<ClientExtended[]>([]);
  
  // Load clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
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
          setFilteredClients(mappedData);
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

  // Filter clients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = clients.filter(
        client =>
          client.companyName.toLowerCase().includes(lowercasedSearch) ||
          (client.recruiterName && client.recruiterName.toLowerCase().includes(lowercasedSearch)) ||
          (client.position && client.position.toLowerCase().includes(lowercasedSearch)) ||
          (client.email && client.email.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  return {
    clients,
    setClients,
    searchTerm,
    setSearchTerm,
    filteredClients,
    loading
  };
};
