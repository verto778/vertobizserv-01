
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ClientExtended } from '@/types/client-extended';

export const useClientList = () => {
  const [clients, setClients] = useState<ClientExtended[]>([]);
  
  // Load active clients from Supabase
  useEffect(() => {
    const fetchActiveClients = async () => {
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
        toast({
          title: "Error loading clients",
          description: error.message || "Failed to load active clients",
          variant: "destructive",
        });
      }
    };

    fetchActiveClients();
  }, []);

  return { clients };
};
