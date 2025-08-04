
import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientExtended } from '@/types/client-extended';

interface ClientTableProps {
  clients: ClientExtended[];
  onEdit: (client: ClientExtended) => void;
}

export const ClientTable = ({ clients, onEdit }: ClientTableProps) => {
  if (clients.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No clients added yet. Add a client to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.recruiterName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(client)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
