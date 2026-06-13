import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Filter, BarChart3 } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { useCandidateManagement } from '@/hooks/useCandidateManagement';
import { useClientData } from '@/hooks/useClientData';
import { useRecruiters } from '@/hooks/useRecruiters';
import { useFilteredData } from '@/hooks/useFilteredData';
import ReportFilters from './ReportFilters';
import AttendedCasesChart from './AttendedCasesChart';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Candidate } from '@/components/candidates/types';
import { candidateService } from '@/services/candidateService';

interface AttendedCasesData {
  month: string;
  Attended: number;
  'Client Conf Pending': number;
  Confirmed: number;
  'Not Attended': number;
  'Not Interested': number;
  'Position Hold': number;
  Reschedule: number;
  'Yet to Confirm': number;
}

interface AttendedCasesReportsProps {
  selectedClients?: string[];
  selectedRecruiters?: string[];
  selectedManagers?: string[];
  dateRange?: { from?: Date; to?: Date };
  managers?: { id: string; name: string; }[];
}

const INDIA_TIMEZONE = 'Asia/Kolkata';

const statusCategories = [
  'Attended',
  'Client Conf Pending',
  'Confirmed',
  'Not Attended',
  'Not Interested',
  'Position Hold',
  'Reschedule',
  'Yet to Confirm'
] as const;

const status1ToCategory = new Map<string, typeof statusCategories[number]>(
  statusCategories.map(category => [category.trim().toLowerCase(), category])
);

const getInterviewMonthKey = (date: Date) => formatInTimeZone(date, INDIA_TIMEZONE, 'yyyy-MM');

const getMonthLabel = (date: Date) => formatInTimeZone(date, INDIA_TIMEZONE, 'MMM yyyy');

const createEmptyMonthData = (month: string): AttendedCasesData => ({
  month,
  Attended: 0,
  'Client Conf Pending': 0,
  Confirmed: 0,
  'Not Attended': 0,
  'Not Interested': 0,
  'Position Hold': 0,
  Reschedule: 0,
  'Yet to Confirm': 0,
});

const AttendedCasesReports: React.FC<AttendedCasesReportsProps> = ({
  selectedClients = [],
  selectedRecruiters = [],
  selectedManagers = [],
  dateRange,
  managers = []
}) => {
  const [localSelectedClients, setLocalSelectedClients] = useState<string[]>([]);
  const [localSelectedRecruiters, setLocalSelectedRecruiters] = useState<string[]>([]);
  const [localSelectedManagers, setLocalSelectedManagers] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('6'); // Default 6 months
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  
  // Run manager normalization on component mount
  useEffect(() => {
    const normalizeManagersOnLoad = async () => {
      try {
        await candidateService.normalizeExistingManagers();
        console.log('Manager names normalized successfully on reports load');
      } catch (error) {
        console.error('Failed to normalize manager names:', error);
      }
    };
    
    normalizeManagersOnLoad();
  }, []);
  
  const { candidates } = useCandidateManagement();
  const { clients } = useClientData();
  const { recruiters } = useRecruiters(true);
  const { exportToExcel } = useFilteredData();

  // Generate unique managers from candidates data
  const uniqueManagers = useMemo(() => {
    const managerSet = new Set<string>();
    candidates.forEach(candidate => {
      const manager = (candidate.manager || '').trim();
      if (manager && manager !== '') {
        managerSet.add(manager);
      }
    });
    
    return Array.from(managerSet)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map((name, index) => ({ id: `manager-${index}`, name }));
  }, [candidates]);

  // Use props if provided, otherwise use local state
  const finalSelectedClients = selectedClients.length > 0 ? selectedClients : localSelectedClients;
  const finalSelectedRecruiters = selectedRecruiters.length > 0 ? selectedRecruiters : localSelectedRecruiters;
  const finalSelectedManagers = selectedManagers.length > 0 ? selectedManagers : localSelectedManagers;

  // Custom status checking function for new 8 categories based on status1
  const checkCandidateStatus = (candidate: Candidate, category: string): boolean => {
    const normalizedStatus1 = (candidate.status1 || '').trim().toLowerCase();
    return status1ToCategory.get(normalizedStatus1) === category;
  };

  // Process candidates data for attended cases analysis
  const attendedCasesData = useMemo((): AttendedCasesData[] => {
    const currentDate = new Date();
    let months: Array<{
      key: string;
      monthName: string;
      startDate: Date;
      endDate: Date;
    }> = [];

    if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
      let cursor = new Date(customDateRange.from.getFullYear(), customDateRange.from.getMonth(), 1);
      const endCursor = new Date(customDateRange.to.getFullYear(), customDateRange.to.getMonth(), 1);

      while (cursor <= endCursor) {
        months.push({
          key: format(cursor, 'yyyy-MM'),
          monthName: format(cursor, 'MMM yyyy'),
          startDate: startOfMonth(cursor),
          endDate: endOfMonth(cursor)
        });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
    } else {
      const monthsToShow = parseInt(timeRange, 10) || 6;
      for (let i = 0; i < monthsToShow; i++) {
        const date = subMonths(currentDate, i);
        months.unshift({
          key: format(date, 'yyyy-MM'),
          monthName: format(date, 'MMM yyyy'),
          startDate: startOfMonth(date),
          endDate: endOfMonth(date)
        });
      }
    }

    let filteredCandidates = candidates.filter(candidate => {
      if (finalSelectedClients.length > 0 && !finalSelectedClients.includes(candidate.clientName)) {
        return false;
      }

      if (finalSelectedRecruiters.length > 0 && !finalSelectedRecruiters.includes(candidate.recruiterName)) {
        return false;
      }

      if (finalSelectedManagers.length > 0) {
        const candidateManager = (candidate.manager || '').trim();
        const normalizedSelectedManagers = finalSelectedManagers.map(m => m.trim());

        if (!normalizedSelectedManagers.includes(candidateManager)) {
          return false;
        }
      }

      return true;
    });

    if (dateRange?.from && dateRange?.to) {
      filteredCandidates = filteredCandidates.filter(candidate => {
        const candidateDate = candidate.interviewDate;
        if (!candidateDate) return false;
        return candidateDate >= dateRange.from! && candidateDate <= dateRange.to!;
      });
    }

    const monthlyBuckets = filteredCandidates.reduce<Record<string, AttendedCasesData>>((acc, candidate) => {
      const candidateDate = candidate.interviewDate;
      if (!candidateDate) return acc;

      const monthKey = format(candidateDate, 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: format(candidateDate, 'MMM yyyy'),
          Attended: 0,
          'Client Conf Pending': 0,
          Confirmed: 0,
          'Not Attended': 0,
          'Not Interested': 0,
          'Position Hold': 0,
          Reschedule: 0,
          'Yet to Confirm': 0,
        };
      }

      const categories = ['Attended', 'Client Conf Pending', 'Confirmed', 'Not Attended', 'Not Interested', 'Position Hold', 'Reschedule', 'Yet to Confirm'] as const;
      const matchingCategory = categories.find(category => checkCandidateStatus(candidate, category));

      if (matchingCategory) {
        acc[monthKey][matchingCategory] += 1;
      }

      return acc;
    }, {});

    return months.map(({ key, monthName }) => (
      monthlyBuckets[key] || {
        month: monthName,
        Attended: 0,
        'Client Conf Pending': 0,
        Confirmed: 0,
        'Not Attended': 0,
        'Not Interested': 0,
        'Position Hold': 0,
        Reschedule: 0,
        'Yet to Confirm': 0,
      }
    ));
  }, [candidates, finalSelectedClients, finalSelectedRecruiters, finalSelectedManagers, timeRange, customDateRange, dateRange]);

  // Calculate percentage data for Report2b - fixed logic with accurate percentages that sum to 100%
  const attendedCasesPercentageData = useMemo((): AttendedCasesData[] => {
    return attendedCasesData.map(monthData => {
      // Calculate total for the month (excluding the month name)
      const total = Object.keys(monthData)
        .filter(key => key !== 'month')
        .reduce((sum, key) => sum + (monthData[key as keyof AttendedCasesData] as number), 0);
      
      console.log(`Month ${monthData.month} total:`, total);
      
      if (total === 0) {
        // If no data for this month, return zeros
        return {
          month: monthData.month,
          Attended: 0,
          'Client Conf Pending': 0,
          Confirmed: 0,
          'Not Attended': 0,
          'Not Interested': 0,
          'Position Hold': 0,
          Reschedule: 0,
          'Yet to Confirm': 0
        };
      }
      
      // Calculate exact percentages first
      const exactPercentages = {
        Attended: (monthData.Attended / total) * 100,
        'Client Conf Pending': (monthData['Client Conf Pending'] / total) * 100,
        Confirmed: (monthData.Confirmed / total) * 100,
        'Not Attended': (monthData['Not Attended'] / total) * 100,
        'Not Interested': (monthData['Not Interested'] / total) * 100,
        'Position Hold': (monthData['Position Hold'] / total) * 100,
        Reschedule: (monthData.Reschedule / total) * 100,
        'Yet to Confirm': (monthData['Yet to Confirm'] / total) * 100
      };
      
      // Round to integers
      const roundedPercentages = Object.fromEntries(
        Object.entries(exactPercentages).map(([key, value]) => [key, Math.round(value)])
      );
      
      // Calculate sum of rounded percentages
      const roundedSum = Object.values(roundedPercentages).reduce((sum, val) => sum + val, 0);
      
      // Adjust for rounding errors to ensure sum equals 100
      if (roundedSum !== 100 && total > 0) {
        const difference = 100 - roundedSum;
        // Find the category with the largest exact percentage to adjust
        const largestCategory = Object.entries(exactPercentages)
          .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: '', value: -1 });
        
        if (largestCategory.key) {
          roundedPercentages[largestCategory.key] += difference;
        }
      }
      
      const percentageData = {
        month: monthData.month,
        Attended: roundedPercentages.Attended,
        'Client Conf Pending': roundedPercentages['Client Conf Pending'],
        Confirmed: roundedPercentages.Confirmed,
        'Not Attended': roundedPercentages['Not Attended'],
        'Not Interested': roundedPercentages['Not Interested'],
        'Position Hold': roundedPercentages['Position Hold'],
        Reschedule: roundedPercentages.Reschedule,
        'Yet to Confirm': roundedPercentages['Yet to Confirm']
      };
      
      console.log(`Month ${monthData.month} percentages:`, percentageData);
      console.log(`Sum: ${Object.values(percentageData).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0)}%`);
      return percentageData;
    });
  }, [attendedCasesData]);

  // Handle Excel export
  const handleExportExcel = (isPercentage = false) => {
    const dataToExport = isPercentage ? attendedCasesPercentageData : attendedCasesData;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters to include data.",
        variant: "destructive"
      });
      return;
    }

    const exportData = dataToExport.map(item => ({
      'Month': item.month,
      'Attended': isPercentage ? `${item.Attended}%` : item.Attended,
      'Client Conf Pending': isPercentage ? `${item['Client Conf Pending']}%` : item['Client Conf Pending'],
      'Confirmed': isPercentage ? `${item.Confirmed}%` : item.Confirmed,
      'Not Attended': isPercentage ? `${item['Not Attended']}%` : item['Not Attended'],
      'Not Interested': isPercentage ? `${item['Not Interested']}%` : item['Not Interested'],
      'Position Hold': isPercentage ? `${item['Position Hold']}%` : item['Position Hold'],
      'Reschedule': isPercentage ? `${item.Reschedule}%` : item.Reschedule,
      'Yet to Confirm': isPercentage ? `${item['Yet to Confirm']}%` : item['Yet to Confirm']
    }));

    const fileName = `attended-cases-${isPercentage ? 'percentage' : 'count'}-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToExcel(exportData, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportFilters
              clients={clients}
              recruiters={recruiters}
              managers={uniqueManagers}
              selectedClients={localSelectedClients}
              selectedRecruiters={localSelectedRecruiters}
              selectedManagers={localSelectedManagers}
              onClientsChange={setLocalSelectedClients}
              onRecruitersChange={setLocalSelectedRecruiters}
              onManagersChange={setLocalSelectedManagers}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
              
              {timeRange === 'custom' && (
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDateRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {customDateRange?.from ? (
                          customDateRange.to ? (
                            <>
                              {format(customDateRange.from, "MMM dd, yyyy")} - {format(customDateRange.to, "MMM dd, yyyy")}
                            </>
                          ) : (
                            format(customDateRange.from, "MMM dd, yyyy")
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
                        defaultMonth={customDateRange?.from}
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={2}
                        className="p-3 pointer-events-auto"
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="counts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="counts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report2a: Counts
          </TabsTrigger>
          <TabsTrigger value="percentages" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report2b: Percentages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="counts" className="space-y-6">
          <AttendedCasesChart
            data={attendedCasesData}
            isPercentage={false}
            onExportExcel={() => handleExportExcel(false)}
            onExportPercentageExcel={() => handleExportExcel(true)}
            title="Interview Cases - Counts"
            description="Monthly breakdown of interview outcomes (absolute numbers)"
          />
        </TabsContent>

        <TabsContent value="percentages" className="space-y-6">
          <AttendedCasesChart
            data={attendedCasesPercentageData}
            isPercentage={true}
            onExportExcel={() => handleExportExcel(true)}
            title="Interview Count Percentage"
            description="Monthly breakdown of interview outcomes (percentage distribution)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendedCasesReports;
