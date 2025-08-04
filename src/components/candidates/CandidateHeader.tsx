
import React from 'react';
import { Plus, Filter, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CandidateHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
  sortOrder: 'asc' | 'desc' | 'none';
  onSortChange: (order: 'asc' | 'desc' | 'none') => void;
}

const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
  sortOrder,
  onSortChange
}) => {
  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc':
        return <ArrowUpAZ className="h-4 w-4" />;
      case 'desc':
        return <ArrowDownAZ className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'asc':
        return 'Name A-Z';
      case 'desc':
        return 'Name Z-A';
      default:
        return 'Sort by Name';
    }
  };

  const isSortingEnabled = sortOrder !== 'none';

  const handleEnableSortingChange = (checked: boolean) => {
    if (checked) {
      onSortChange('asc'); // Default to ascending when enabling
    } else {
      onSortChange('none'); // Disable sorting
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600 mt-1">Manage interview candidates and their details</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          {/* Enable Sorting Checkbox */}
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white">
            <Checkbox 
              id="enable-sorting-header"
              checked={isSortingEnabled}
              onCheckedChange={(checked) => handleEnableSortingChange(checked === true)}
            />
            <label htmlFor="enable-sorting-header" className="text-sm font-medium cursor-pointer whitespace-nowrap">
              Enable Sorting
            </label>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-shrink-0"
                disabled={!isSortingEnabled}
              >
                {getSortIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem 
                onClick={() => onSortChange('asc')}
                className="cursor-pointer"
              >
                <ArrowUpAZ className="h-4 w-4 mr-2" />
                Name A-Z
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSortChange('desc')}
                className="cursor-pointer"
              >
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                Name Z-A
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSortChange('none')}
                className="cursor-pointer"
              >
                <Filter className="h-4 w-4 mr-2" />
                No Sorting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button onClick={onAddClick} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>
    </div>
  );
};

export default CandidateHeader;
