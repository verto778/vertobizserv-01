
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import PositionSelect from './PositionSelect';
import { Client } from '../types';

interface ClientSectionProps {
  clients: Client[];
  selectedClientId: string;
  position: string;
  isPositionDisabled: boolean;
  handleClientSelect: (clientId: string) => void;
  handleSelectChange: (name: string, value: string) => void;
  showClient?: boolean;
  showPosition?: boolean;
}

const ClientSection: React.FC<ClientSectionProps> = ({ 
  clients, 
  selectedClientId, 
  position,
  isPositionDisabled,
  handleClientSelect, 
  handleSelectChange,
  showClient = true,
  showPosition = true
}) => {
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // Sort clients based on the toggle state
  const sortedClients = useMemo(() => {
    if (!sortAlphabetically) return clients;
    
    return [...clients].sort((a, b) => 
      a.companyName.toLowerCase().localeCompare(b.companyName.toLowerCase())
    );
  }, [clients, sortAlphabetically]);

  return (
    <>
      {showClient && (
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select 
            value={selectedClientId} 
            onValueChange={handleClientSelect}
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white">
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {clients.length} client{clients.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortAlphabetically(!sortAlphabetically)}
                  className="h-6 px-2 text-xs"
                >
                  {sortAlphabetically ? 'Default' : 'A-Z'}
                </Button>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {sortedClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName}
                    </SelectItem>
                  ))}
                </div>
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {showPosition && (
        <PositionSelect
          value={position}
          onChange={(value) => handleSelectChange('position', value)}
          disabled={isPositionDisabled}
          clientId={selectedClientId}
        />
      )}
    </>
  );
};

export default ClientSection;
