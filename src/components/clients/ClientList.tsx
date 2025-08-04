
import React from 'react';
import { ClientRow } from './ClientRow';
import { Client } from '@/types/client';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';

interface ClientListProps {
  clients: Client[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ClientList = ({ clients, onEdit, onDelete, onToggleStatus }: ClientListProps) => {
  if (clients.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No clients found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Client Name</TableHead>
            <TableHead className="w-[25%]">Status</TableHead>
            <TableHead className="w-[25%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
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
