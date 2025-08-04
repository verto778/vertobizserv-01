
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface DataPreviewProps {
  isLoading: boolean;
  data: any[];
}

const DataPreview = ({ isLoading, data }: DataPreviewProps) => {
  const renderDataPreview = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading data...</div>;
    }
    
    if (data.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No data available. Try adjusting your filters.</div>;
    }
    
    // Get first few columns to display
    const previewColumns = Object.keys(data[0]).slice(0, 4);
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {previewColumns.map(column => (
                <TableHead key={column}>{column.replace(/_/g, ' ')}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 5).map((row, index) => (
              <TableRow key={index}>
                {previewColumns.map(column => (
                  <TableCell key={`${index}-${column}`}>{row[column]?.toString() || 'N/A'}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 5 && (
          <p className="text-sm text-center mt-2 text-muted-foreground">
            Showing 5 of {data.length} records. Export to see all.
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {renderDataPreview()}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
