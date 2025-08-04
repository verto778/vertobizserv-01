
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableRow, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Position } from '@/types/position';

interface PositionRowProps {
  position: Position;
  showClientName: boolean;
  clientPositionCount: number;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const PositionRow = ({ 
  position, 
  showClientName, 
  clientPositionCount, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: PositionRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(position.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const handleSave = () => {
    onEdit(position.id, editedName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(position.name);
    setIsEditing(false);
  };

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-48"
              autoFocus
            />
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        ) : (
          <span className="font-medium">{position.name}</span>
        )}
      </TableCell>
      <TableCell>
        {showClientName && (
          <div className="font-medium text-gray-900">
            {position.clientName}
            {clientPositionCount > 1 && (
              <span className="text-xs text-gray-500 ml-2">
                ({clientPositionCount} positions)
              </span>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={position.isActive}
            onCheckedChange={() => {
              if (position.isActive) {
                setShowStatusDialog(true);
              } else {
                onToggleStatus(position.id);
              }
            }}
            className={position.isActive ? "bg-green-500" : "bg-red-500"}
          />
          <span className={position.isActive ? "text-green-600" : "text-red-600"}>
            {position.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the position. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(position.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the position as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onToggleStatus(position.id);
                setShowStatusDialog(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TableRow>
  );
};
