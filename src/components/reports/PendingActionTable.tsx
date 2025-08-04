
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { PendingActionData } from './PendingActionReport';

interface PendingActionTableProps {
  data: PendingActionData[];
}

const PendingActionTable: React.FC<PendingActionTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<keyof PendingActionData>('daysPending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof PendingActionData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Client Confirmation':
        return 'bg-blue-100 text-blue-800';
      case 'Yet to confirm':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Attended':
        return 'bg-red-100 text-red-800';
      case 'Reschedule':
        return 'bg-orange-100 text-orange-800';
      case 'Feedback Awaited':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimePeriodBadgeColor = (timePeriod: string) => {
    switch (timePeriod) {
      case 'Below 7 days':
        return 'bg-green-100 text-green-800';
      case '8-15 days':
        return 'bg-yellow-100 text-yellow-800';
      case '16-30 days':
        return 'bg-orange-100 text-orange-800';
      case '31-60 days':
        return 'bg-red-100 text-red-800';
      case 'Above 60 days':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortButton: React.FC<{ field: keyof PendingActionData; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="candidateName">Candidate Name</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="clientName">Client</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="recruiterName">Recruiter</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="position">Position</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="daysPending">Days Pending</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="timePeriod">Time Period</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="lastUpdated">Last Updated</SortButton>
            </TableHead>
            <TableHead>Interview Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No pending actions found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.candidateName}</TableCell>
                <TableCell>{item.clientName}</TableCell>
                <TableCell>{item.recruiterName}</TableCell>
                <TableCell>{item.position}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={item.daysPending > 60 ? 'font-bold text-red-600' : item.daysPending > 30 ? 'font-medium text-orange-600' : ''}>
                    {item.daysPending} days
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getTimePeriodBadgeColor(item.timePeriod)}>
                    {item.timePeriod}
                  </Badge>
                </TableCell>
                <TableCell>{format(item.lastUpdated, 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {item.interviewDate ? format(item.interviewDate, 'MMM dd, yyyy') : 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingActionTable;
