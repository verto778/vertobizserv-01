import React from 'react';
import { ManagerRow } from './ManagerRow';
import { Manager } from '@/types/manager';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';

interface ManagerListProps {
  managers: Manager[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ManagerList = ({ managers, onEdit, onDelete, onToggleStatus }: ManagerListProps) => {
  if (managers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No managers found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Manager Name</TableHead>
            <TableHead className="w-[25%]">Status</TableHead>
            <TableHead className="w-[25%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {managers.map((manager) => (
            <ManagerRow
              key={manager.id}
              manager={manager}
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