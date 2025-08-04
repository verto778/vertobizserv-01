
import React from 'react';
import { RecruiterRow } from './RecruiterRow';
import { Recruiter } from '@/types/recruiter';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';

interface RecruiterListProps {
  recruiters: Recruiter[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const RecruiterList = ({ recruiters, onEdit, onDelete, onToggleStatus }: RecruiterListProps) => {
  if (recruiters.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No recruiters found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Recruiter Name</TableHead>
            <TableHead className="w-[25%]">Status</TableHead>
            <TableHead className="w-[25%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recruiters.map((recruiter) => (
            <RecruiterRow
              key={recruiter.id}
              recruiter={recruiter}
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
