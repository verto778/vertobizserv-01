import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ReportFiltersProps {
  clients: any[];
  recruiters: any[];
  managers?: any[];
  selectedClients: string[];
  selectedRecruiters: string[];
  selectedManagers?: string[];
  onClientsChange: (clients: string[]) => void;
  onRecruitersChange: (recruiters: string[]) => void;
  onManagersChange?: (managers: string[]) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  clients,
  recruiters,
  managers = [],
  selectedClients,
  selectedRecruiters,
  selectedManagers = [],
  onClientsChange,
  onRecruitersChange,
  onManagersChange = () => {},
}) => {
  const [clientsOpen, setClientsOpen] = useState(false);
  const [recruitersOpen, setRecruitersOpen] = useState(false);
  const [managersOpen, setManagersOpen] = useState(false);

  console.log('ReportFilters - clients:', clients);
  console.log('ReportFilters - recruiters:', recruiters);

  const handleClientToggle = (clientName: string) => {
    const updated = selectedClients.includes(clientName)
      ? selectedClients.filter(c => c !== clientName)
      : [...selectedClients, clientName];
    onClientsChange(updated);
  };

  const handleRecruiterToggle = (recruiterName: string) => {
    const updated = selectedRecruiters.includes(recruiterName)
      ? selectedRecruiters.filter(r => r !== recruiterName)
      : [...selectedRecruiters, recruiterName];
    onRecruitersChange(updated);
  };

  const handleManagerToggle = (managerName: string) => {
    const updated = selectedManagers.includes(managerName)
      ? selectedManagers.filter(m => m !== managerName)
      : [...selectedManagers, managerName];
    onManagersChange(updated);
  };

  const clearAllFilters = () => {
    onClientsChange([]);
    onRecruitersChange([]);
    onManagersChange([]);
  };

  const totalFilters = selectedClients.length + selectedRecruiters.length + selectedManagers.length;

  // Get unique client names
  const uniqueClients = clients ? clients.filter((client, index, self) => {
    const clientName = client.companyName || client.name || client.company_name;
    return clientName && self.findIndex(c => (c.companyName || c.name || c.company_name) === clientName) === index;
  }) : [];

  // Get unique recruiter names
  const uniqueRecruiters = recruiters ? recruiters.filter((recruiter, index, self) => {
    const recruiterName = recruiter.name || recruiter.recruiter_name;
    return recruiterName && self.findIndex(r => (r.name || r.recruiter_name) === recruiterName) === index;
  }) : [];

  // Get unique manager names
  const uniqueManagers = managers ? managers.filter((manager, index, self) => {
    const managerName = manager.name;
    return managerName && self.findIndex(m => m.name === managerName) === index;
  }) : [];

  return (
    <div className="flex flex-col space-y-4">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Client Filter */}
        <Popover open={clientsOpen} onOpenChange={setClientsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Client Wise Filter
              {selectedClients.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {selectedClients.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-gray-800 border shadow-lg z-50" align="start">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Select Clients</h4>
              <Separator />
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {uniqueClients && uniqueClients.length > 0 ? (
                    uniqueClients.map((client, index) => {
                      const clientName = client.companyName || client.name || client.company_name || 'Unknown Client';
                      const clientId = client.id || `client-${index}`;
                      
                      return (
                        <div key={clientId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`client-${clientId}`}
                            checked={selectedClients.includes(clientName)}
                            onCheckedChange={() => handleClientToggle(clientName)}
                          />
                          <label
                            htmlFor={`client-${clientId}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {clientName}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">No clients available</div>
                  )}
                </div>
              </ScrollArea>
              <Separator />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClientsChange([])}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClientsChange(uniqueClients.map(c => c.companyName || c.name || c.company_name))}
                >
                  Select All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Recruiter Filter */}
        <Popover open={recruitersOpen} onOpenChange={setRecruitersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Recruiter Wise Filter
              {selectedRecruiters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {selectedRecruiters.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-gray-800 border shadow-lg z-50" align="start">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Select Recruiters</h4>
              <Separator />
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {uniqueRecruiters && uniqueRecruiters.length > 0 ? (
                    uniqueRecruiters.map((recruiter, index) => {
                      const recruiterName = recruiter.name || recruiter.recruiter_name || 'Unknown Recruiter';
                      const recruiterId = recruiter.id || `recruiter-${index}`;
                      
                      return (
                        <div key={recruiterId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`recruiter-${recruiterId}`}
                            checked={selectedRecruiters.includes(recruiterName)}
                            onCheckedChange={() => handleRecruiterToggle(recruiterName)}
                          />
                          <label
                            htmlFor={`recruiter-${recruiterId}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {recruiterName}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">No recruiters available</div>
                  )}
                </div>
              </ScrollArea>
              <Separator />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecruitersChange([])}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecruitersChange(uniqueRecruiters.map(r => r.name || r.recruiter_name))}
                >
                  Select All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Manager Filter - Only show if managers are provided */}
        {managers.length > 0 && (
          <Popover open={managersOpen} onOpenChange={setManagersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Manager Wise Filter
                {selectedManagers.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {selectedManagers.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white dark:bg-gray-800 border shadow-lg z-50" align="start">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Select Managers</h4>
                <Separator />
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {uniqueManagers && uniqueManagers.length > 0 ? (
                      uniqueManagers.map((manager, index) => {
                        const managerName = manager.name || 'Unknown Manager';
                        const managerId = manager.id || `manager-${index}`;
                        
                        return (
                          <div key={managerId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`manager-${managerId}`}
                              checked={selectedManagers.includes(managerName)}
                              onCheckedChange={() => handleManagerToggle(managerName)}
                            />
                            <label
                              htmlFor={`manager-${managerId}`}
                              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {managerName}
                            </label>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">No managers available</div>
                    )}
                  </div>
                </ScrollArea>
                <Separator />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManagersChange([])}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManagersChange(uniqueManagers.map(m => m.name))}
                  >
                    Select All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All Filters Button */}
        {totalFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {totalFilters > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedClients.map((client) => (
            <Badge key={client} variant="secondary" className="text-xs">
              {client}
              <button
                onClick={() => handleClientToggle(client)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedRecruiters.map((recruiter) => (
            <Badge key={recruiter} variant="secondary" className="text-xs">
              {recruiter}
              <button
                onClick={() => handleRecruiterToggle(recruiter)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedManagers.map((manager) => (
            <Badge key={manager} variant="secondary" className="text-xs">
              {manager}
              <button
                onClick={() => handleManagerToggle(manager)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
