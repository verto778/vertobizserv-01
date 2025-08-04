
import React, { useMemo } from 'react';
import { PositionRow } from './PositionRow';
import { Position } from '@/types/position';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';

interface PositionListProps {
  positions: Position[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const PositionList = ({ positions, onEdit, onDelete, onToggleStatus }: PositionListProps) => {
  // Calculate client position counts
  const clientPositionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    positions.forEach(position => {
      counts[position.clientId] = (counts[position.clientId] || 0) + 1;
    });
    return counts;
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No positions found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Position Name</TableHead>
            <TableHead className="w-[30%]">Client</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <PositionRow
              key={position.id}
              position={position}
              showClientName={true}
              clientPositionCount={clientPositionCounts[position.clientId] || 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
