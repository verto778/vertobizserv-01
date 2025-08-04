
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClientList } from '@/hooks/useClientList';

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, clientId: string) => void;
}

export const AddPositionDialog = ({ open, onOpenChange, onSubmit }: AddPositionDialogProps) => {
  const [name, setName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { clients } = useClientList();

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName('');
      setSelectedClientId('');
    }
  }, [open]);

  // Sort clients alphabetically based on sortOrder
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.companyName.localeCompare(b.companyName);
      } else {
        return b.companyName.localeCompare(a.companyName);
      }
    });
  }, [clients, sortOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedClientId) {
      onSubmit(name.trim(), selectedClientId);
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSelectedClientId('');
    onOpenChange(false);
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    // Ensure position name is not affected by client selection
    console.log('Client selected:', clientId, 'Position name remains:', name);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="client">Select Client</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="h-8 px-2 text-xs"
                >
                  Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
              </div>
              <Select value={selectedClientId} onValueChange={handleClientChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <ScrollArea className="h-[200px]">
                    <div className="p-1">
                      {sortedClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName}
                        </SelectItem>
                      ))}
                    </div>
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Position Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  console.log('Position name changed to:', e.target.value);
                  setName(e.target.value);
                }}
                placeholder="Enter position name (e.g., Software Engineer, Data Analyst)"
                required
                className="bg-white"
              />
              {/* Visual helper to show current values during debugging */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                  Debug: Client ID = "{selectedClientId}", Position Name = "{name}"
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !selectedClientId}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
