
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { FileSpreadsheet, Download, X, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExportDataProps {
  dataType: 'candidates' | 'clients';
  setDataType: (value: 'candidates' | 'clients') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedMonth: Date | undefined;
  setSelectedMonth: (date: Date | undefined) => void;
  selectedMonthValue: number | undefined;
  setSelectedMonthValue: (month: number | undefined) => void;
  selectedYearValue: number | undefined;
  setSelectedYearValue: (year: number | undefined) => void;
  exportType: 'range' | 'month';
  setExportType: (type: 'range' | 'month') => void;
  handleExport: () => void;
  isLoading: boolean;
  dataLength: number;
}

const ExportData = ({
  dataType,
  setDataType,
  dateRange,
  setDateRange,
  selectedMonthValue,
  setSelectedMonthValue,
  selectedYearValue,
  setSelectedYearValue,
  exportType,
  setExportType,
  handleExport,
  isLoading
}: ExportDataProps) => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const handleYearChange = (value: string) => {
    // Allow empty string or only numeric input
    if (value === '' || /^\d{0,4}$/.test(value)) {
      const year = value === '' ? undefined : parseInt(value);
      setSelectedYearValue(year);
    }
  };

  const handleClearYear = () => {
    setSelectedYearValue(undefined);
  };

  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const isYearValid = selectedYearValue === undefined || (selectedYearValue >= 1900 && selectedYearValue <= 2100 && selectedYearValue.toString().length === 4);

  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-white w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Export Data</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label htmlFor="data-type" className="text-base font-medium text-gray-700">Data Type</Label>
          <Select value={dataType} onValueChange={(value: 'candidates' | 'clients') => setDataType(value)}>
            <SelectTrigger className="w-full border-gray-300 bg-white">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candidates">Candidates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium text-gray-700">Export Type</Label>
            <Select value={exportType} onValueChange={(value: 'range' | 'month') => setExportType(value)}>
              <SelectTrigger className="w-full border-gray-300 bg-white">
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month/Year Selection</SelectItem>
                <SelectItem value="range">Date Range Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportType === 'month' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-700">Month (Optional)</Label>
                <Select 
                  value={selectedMonthValue?.toString() || 'any_month'} 
                  onValueChange={(value) => setSelectedMonthValue(value === 'any_month' ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="w-full border-gray-300 bg-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_month">Any Month</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-700">Year</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter year (e.g., 2024)"
                    value={selectedYearValue?.toString() || ''}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className={`flex-1 border-gray-300 bg-white ${!isYearValid ? 'border-red-500' : ''}`}
                    maxLength={4}
                  />
                  {selectedYearValue && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearYear}
                      className="px-2 hover:bg-gray-100"
                      title="Clear year"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!isYearValid && (
                  <p className="text-sm text-red-500">Please enter a valid 4-digit year between 1900 and 2100</p>
                )}
              </div>
            </div>
          )}

          {exportType === 'range' && (
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-700">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal border-gray-300 bg-white",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {(dateRange?.from || dateRange?.to) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearDateRange}
                    className="px-2 hover:bg-gray-100"
                    title="Clear date range"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {dateRange?.from && dateRange?.to && (
                <p className="text-sm text-gray-600">
                  Selected range: {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          )}
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Export Options:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {exportType === 'month' ? (
                <>
                  <li>Select both Month & Year: Export data for that specific month only</li>
                  <li>Select Year only: Export data for the entire year</li>
                </>
              ) : (
                <>
                  <li>Select a date range to export data between specific dates</li>
                  <li>Choose both start and end dates for precise filtering</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          onClick={handleExport}
          disabled={isLoading || !isYearValid || (exportType === 'range' && (!dateRange?.from || !dateRange?.to))}
        >
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportData;
