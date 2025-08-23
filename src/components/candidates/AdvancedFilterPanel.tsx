import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { interviewModeOptions, status1Options, status2Options } from './formOptions';
import { usePositions } from '@/hooks/usePositions';

export interface FilterState {
  mode: string;
  status1: string;
  status2: string;
  round: string;
  clientName: string;
  position: string;
  interviewDate: Date | null;
  manager: string;
}

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFilterChange: (filterName: keyof FilterState, value: string) => void;
  onDateFilterChange: (date: Date | null) => void;
  onClearFilters: () => void;
  clients: Array<{ id: string; companyName: string; position?: string }>;
  positions: Array<{ id: string; name: string }>;
  candidates: Array<{ manager?: string }>;
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isOpen,
  onToggle,
  filters,
  onFilterChange,
  onDateFilterChange,
  onClearFilters,
  clients,
  positions,
  candidates
}) => {
  const [sortClientsAlphabetically, setSortClientsAlphabetically] = useState(false);
  const [sortPositionsAlphabetically, setSortPositionsAlphabetically] = useState(false);

  // Get unique managers from candidates
  const uniqueManagers = useMemo(() => {
    const managers = new Set<string>();
    candidates.forEach(candidate => {
      if (candidate.manager && candidate.manager.trim() !== '') {
        managers.add(candidate.manager);
      }
    });
    return Array.from(managers).sort();
  }, [candidates]);

  // Get the selected client ID based on the client name
  const selectedClientId = useMemo(() => {
    if (!filters.clientName) return '';
    const selectedClient = clients.find(client => client.companyName === filters.clientName);
    return selectedClient?.id || '';
  }, [filters.clientName, clients]);

  // Fetch positions for the selected client
  const { positions: clientPositions } = usePositions(!!selectedClientId, selectedClientId);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'interviewDate') {
      return value !== null;
    }
    return value && value !== '';
  }).length;

  // Sort clients based on the toggle state
  const sortedClients = useMemo(() => {
    if (!sortClientsAlphabetically) return clients;
    
    return [...clients].sort((a, b) => 
      a.companyName.toLowerCase().localeCompare(b.companyName.toLowerCase())
    );
  }, [clients, sortClientsAlphabetically]);

  // Use client-specific positions if a client is selected, otherwise use all positions
  const availablePositions = useMemo(() => {
    if (filters.clientName && clientPositions.length > 0) {
      return clientPositions;
    }
    return positions;
  }, [filters.clientName, clientPositions, positions]);

  // Sort positions based on the toggle state
  const sortedPositions = useMemo(() => {
    if (!sortPositionsAlphabetically) return availablePositions;
    
    return [...availablePositions].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }, [availablePositions, sortPositionsAlphabetically]);

  const handleClientChange = (value: string) => {
    const newValue = value === 'all_clients' ? '' : value;
    onFilterChange('clientName', newValue);
    
    // Clear position filter when client changes to avoid invalid combinations
    if (filters.position) {
      onFilterChange('position', '');
    }
  };

  const getFilterLabel = (key: keyof FilterState, value: string | Date) => {
    switch (key) {
      case 'mode':
        return `Mode: ${value}`;
      case 'status1':
        return `Status 1: ${value}`;
      case 'status2':
        return `Status 2: ${value}`;
      case 'round':
        return `Round: ${value}`;
      case 'clientName':
        return `Client: ${value}`;
      case 'position':
        return `Position: ${value}`;
      case 'interviewDate':
        return `Date: ${value instanceof Date ? format(value, 'PPP') : value}`;
      case 'manager':
        return `Manager: ${value}`;
      default:
        return value?.toString() || '';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onToggle}
            className="flex items-center gap-2 p-0 h-auto font-medium"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{getFilterLabel(key as keyof FilterState, value)}</span>
                  <button
                    onClick={() => {
                      if (key === 'interviewDate') {
                        onDateFilterChange(null);
                      } else {
                        onFilterChange(key as keyof FilterState, '');
                      }
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter Controls */}
        {isOpen && (
          <div className="space-y-6">
            {/* First Row - Mode, Status 1, Status 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Mode</label>
                <Select 
                  value={filters.mode} 
                  onValueChange={(value) => onFilterChange('mode', value === 'choose_mode' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {interviewModeOptions.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status 1</label>
                <Select 
                  value={filters.status1} 
                  onValueChange={(value) => onFilterChange('status1', value === 'choose_status1' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Status 1" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {status1Options.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status 2</label>
                <Select 
                  value={filters.status2} 
                  onValueChange={(value) => onFilterChange('status2', value === 'choose_status2' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Status 2" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    {status2Options.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row - Round, Client, Position */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Round</label>
                <Select 
                  value={filters.round} 
                  onValueChange={(value) => onFilterChange('round', value === 'all_rounds' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Rounds" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="all_rounds">All Rounds</SelectItem>
                    <SelectItem value="Round 1">Round 1</SelectItem>
                    <SelectItem value="Round 2">Round 2</SelectItem>
                    <SelectItem value="Round 3">Round 3</SelectItem>
                    <SelectItem value="Round 4">Round 4</SelectItem>
                    <SelectItem value="Final Round">Final Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Client</label>
                <Select 
                  value={filters.clientName} 
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="all_clients">All Clients</SelectItem>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="text-xs text-muted-foreground">
                        {sortedClients.length} client{sortedClients.length !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortClientsAlphabetically(!sortClientsAlphabetically)}
                        className="h-6 px-2 text-xs"
                      >
                        {sortClientsAlphabetically ? 'Default' : 'A-Z'}
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="p-1">
                        {sortedClients.map((client) => (
                          <SelectItem key={client.id} value={client.companyName}>
                            {client.companyName}
                          </SelectItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Position</label>
                <Select 
                  value={filters.position} 
                  onValueChange={(value) => onFilterChange('position', value === 'all_positions' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder={
                      filters.clientName && sortedPositions.length === 0 
                        ? "No positions for this client"
                        : "All Positions"
                    } />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="all_positions">All Positions</SelectItem>
                    {sortedPositions.length > 0 && (
                      <>
                        <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-xs text-muted-foreground">
                            {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSortPositionsAlphabetically(!sortPositionsAlphabetically)}
                            className="h-6 px-2 text-xs"
                          >
                            {sortPositionsAlphabetically ? 'Default' : 'A-Z'}
                          </Button>
                        </div>
                        <ScrollArea className="h-[200px]">
                          <div className="p-1">
                            {sortedPositions.map((position) => (
                              <SelectItem key={position.id} value={position.name}>
                                {position.name}
                              </SelectItem>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                    {filters.clientName && sortedPositions.length === 0 && (
                      <SelectItem value="no-positions" disabled>
                        No positions available for this client
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Third Row - Interview Date, Manager */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Interview Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 bg-white",
                        !filters.interviewDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.interviewDate ? format(filters.interviewDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.interviewDate}
                      onSelect={onDateFilterChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Manager</label>
                <Select 
                  value={filters.manager} 
                  onValueChange={(value) => onFilterChange('manager', value === 'all_managers' ? '' : value)}
                >
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="All Managers" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="all_managers">All Managers</SelectItem>
                    {uniqueManagers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilterPanel;
