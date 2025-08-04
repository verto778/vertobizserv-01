
import React, { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { usePositions } from '@/hooks/usePositions';

interface PositionSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  clientId?: string;
}

const PositionSelect: React.FC<PositionSelectProps> = ({ 
  value, 
  onChange,
  disabled = false,
  placeholder = "Select Position",
  clientId 
}) => {
  // Always fetch positions if we have a value (for edit mode) OR if we have clientId
  const shouldFetchPositions = !!clientId || !!value;
  const { positions, isLoading } = usePositions(shouldFetchPositions, clientId);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // Debug log to track value changes
  useEffect(() => {
    console.log("PositionSelect - value:", value, "clientId:", clientId, "positions loaded:", positions.length, "shouldFetch:", shouldFetchPositions);
  }, [value, clientId, positions, shouldFetchPositions]);

  // Sort positions based on the toggle state
  const sortedPositions = useMemo(() => {
    if (!sortAlphabetically) return positions;
    
    return [...positions].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }, [positions, sortAlphabetically]);

  const isDisabled = disabled || isLoading;
  const hasNoPositions = !isLoading && sortedPositions.length === 0 && clientId;
  const hasClientButNoPositions = clientId && !isLoading && sortedPositions.length === 0;

  // FIXED: Ensure the value is properly preserved and displayed
  const selectValue = value && value.trim() !== '' ? value : '';

  return (
    <div className="relative">
      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Select 
        value={selectValue}
        onValueChange={onChange}
        disabled={isDisabled}
      >
        <SelectTrigger className="pl-10">
          <SelectValue placeholder={
            isLoading 
              ? "Loading positions..." 
              : hasClientButNoPositions
                ? "No positions exist for this client"
                : !clientId && !value
                  ? "Select Client First"
                  : placeholder
          }>
            {selectValue || undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-white">
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading positions...</SelectItem>
          ) : !clientId && !value ? (
            <SelectItem value="no-client" disabled>Please select a client first</SelectItem>
          ) : hasNoPositions ? (
            <SelectItem value="no-positions" disabled>No positions exist for this client</SelectItem>
          ) : sortedPositions.length === 0 && !value ? (
            <SelectItem value="no-positions" disabled>No positions available</SelectItem>
          ) : (
            <>
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
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
                  {/* Show saved position value first if it exists and is not in the regular options */}
                  {selectValue && !sortedPositions.find(pos => pos.name === selectValue) && (
                    <SelectItem key={`saved-${selectValue}`} value={selectValue}>
                      {selectValue} (saved)
                    </SelectItem>
                  )}
                  {sortedPositions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.name}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PositionSelect;
