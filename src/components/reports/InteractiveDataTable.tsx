
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InteractiveDataTableProps {
  data: any[];
}

const InteractiveDataTable: React.FC<InteractiveDataTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const timePeriods = [
    { key: 'Below_7_days', label: 'Below 7 days' },
    { key: '8_15_days', label: '8-15 days' },
    { key: '16_30_days', label: '16-30 days' },
    { key: '31_60_days', label: '31-60 days' },
    { key: 'Above_60_days', label: 'Above 60 days' }
  ];

  // Transform data for table display
  const tableData = data.map(item => ({
    ...item,
    total: timePeriods.reduce((sum, period) => sum + (item[period.key] || 0), 0)
  }));

  // Filter and sort data
  const filteredData = tableData
    .filter(item => {
      const matchesSearch = item.status.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Client Confirmation': 'bg-blue-100 text-blue-800',
      'Yet to Confirm': 'bg-yellow-100 text-yellow-800',
      'Not Attended': 'bg-red-100 text-red-800',
      'Reschedule': 'bg-orange-100 text-orange-800',
      'Feedback Awaited': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCellColor = (value: number) => {
    if (value === 0) return '';
    if (value <= 2) return 'bg-green-50';
    if (value <= 5) return 'bg-yellow-50';
    if (value <= 10) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Interactive Data Table
        </CardTitle>
        <CardDescription>
          Explore your data with search, filter, and sorting capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {data.map(item => (
                <SelectItem key={item.status} value={item.status}>
                  {item.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                {timePeriods.map(period => (
                  <TableHead key={period.key} className="text-center">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort(period.key)}
                    >
                      {period.label}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('total')}
                  >
                    Total
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No data found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.status} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    {timePeriods.map(period => (
                      <TableCell 
                        key={period.key} 
                        className={`text-center font-mono ${getCellColor(item[period.key] || 0)}`}
                      >
                        {item[period.key] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {item.total}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Showing {filteredData.length} of {data.length} status categories
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveDataTable;
