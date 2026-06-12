import React, { useState } from 'react';
import AdvancedFilterPanel, { FilterState } from '@/components/candidates/AdvancedFilterPanel';

const initial: FilterState = {
  mode: '', status1: '', status2: '', round: '', clientName: '', position: '', interviewDate: null, manager: ''
};

const FilterTest = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initial);
  return (
    <div className="p-8">
      <AdvancedFilterPanel
        isOpen={open}
        onToggle={() => setOpen(o => !o)}
        filters={filters}
        onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onDateFilterChange={(d) => setFilters(p => ({ ...p, interviewDate: d }))}
        onClearFilters={() => setFilters(initial)}
        clients={[{ id: '1', companyName: 'Acme' }]}
        positions={[{ id: 'p1', name: 'Dev' }]}
        candidates={[{ manager: 'John' }]}
      />
    </div>
  );
};

export default FilterTest;
