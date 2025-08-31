import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Filter, BarChart3 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCandidateManagement } from '@/hooks/useCandidateManagement';
import { useClientData } from '@/hooks/useClientData';
import { useRecruiters } from '@/hooks/useRecruiters';
import { useFilteredData } from '@/hooks/useFilteredData';
import ReportFilters from './ReportFilters';
import AttendedCasesChart from './AttendedCasesChart';
import { toast } from '@/hooks/use-toast';
import { getMonth, getYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Candidate } from '@/components/candidates/types';

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
  
  const { candidates } = useCandidateManagement();
  const { clients } = useClientData();
  const { recruiters } = useRecruiters(true);
  const { exportToExcel } = useFilteredData();

  // Use props if provided, otherwise use local state
  const finalSelectedClients = selectedClients.length > 0 ? selectedClients : localSelectedClients;
  const finalSelectedRecruiters = selectedRecruiters.length > 0 ? selectedRecruiters : localSelectedRecruiters;
  const finalSelectedManagers = selectedManagers.length > 0 ? selectedManagers : localSelectedManagers;

  // Custom status checking function for new 8 categories based on status1
  const checkCandidateStatus = (candidate: Candidate, category: string): boolean => {
    switch (category) {
      case 'Attended':
        return candidate.status1 === 'Attended';
        
      case 'Client Conf Pending':
        return candidate.status1 === 'Client Conf Pending';
        
      case 'Confirmed':
        return candidate.status1 === 'Confirmed';
        
      case 'Not Attended':
        return candidate.status1 === 'Not Attended';
        
      case 'Not Interested':
        return candidate.status1 === 'Not Interested';
        
      case 'Position Hold':
        return candidate.status1 === 'Position Hold';
        
      case 'Reschedule':
        return candidate.status1 === 'Reschedule';
        
      case 'Yet to Confirm':
        return candidate.status1 === 'Yet to Confirm';
        
      default:
        return false;
    }
  };

  // Process candidates data for attended cases analysis
  const attendedCasesData = useMemo((): AttendedCasesData[] => {
    console.log('Processing attended cases data with candidates:', candidates.length);
    
    const currentDate = new Date();
    let months = [];
    
    // Handle custom date range
    if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
      // For custom date range, create a single period
      months = [{
        year: getYear(customDateRange.from),
        month: getMonth(customDateRange.from) + 1,
        monthName: `${format(customDateRange.from, 'MMM dd')} - ${format(customDateRange.to, 'MMM dd, yyyy')}`,
        startDate: customDateRange.from,
        endDate: customDateRange.to
      }];
    } else {
      // Generate months array for predefined ranges
      const monthsToShow = parseInt(timeRange);
      for (let i = 0; i < monthsToShow; i++) {
        const date = subMonths(currentDate, i);
        months.unshift({
          year: getYear(date),
          month: getMonth(date) + 1,
          monthName: format(date, 'MMM yyyy'),
          startDate: startOfMonth(date),
          endDate: endOfMonth(date)
        });
      }
    }

    console.log('Generated months:', months.map(m => m.monthName));

    // Filter candidates
    let filteredCandidates = candidates.filter(candidate => {
      // Filter by selected clients
      if (finalSelectedClients.length > 0 && !finalSelectedClients.includes(candidate.clientName)) {
        return false;
      }
      
      // Filter by selected recruiters
      if (finalSelectedRecruiters.length > 0 && !finalSelectedRecruiters.includes(candidate.recruiterName)) {
        return false;
      }
      
      // Filter by selected managers
      if (finalSelectedManagers.length > 0 && !finalSelectedManagers.includes(candidate.manager || '')) {
        return false;
      }
      
      return true;
    });

    console.log('After client/recruiter filter:', filteredCandidates.length);

    console.log('After client/recruiter filter, before date filtering:', filteredCandidates.length);

    // Process data by month
    const monthlyData = months.map(monthInfo => {
      let monthCandidates;
      
      if (dateRange?.from && dateRange?.to) {
        // If parent date range is provided, filter by the parent date range
        monthCandidates = filteredCandidates.filter(candidate => {
          const candidateDate = candidate.dateInformed;
          if (!candidateDate) return false;
          
          const candidateDateObj = new Date(candidateDate);
          return candidateDateObj >= dateRange.from! && candidateDateObj <= dateRange.to!;
        });
      } else {
        // Otherwise, filter by month
        monthCandidates = filteredCandidates.filter(candidate => {
          const candidateDate = candidate.dateInformed;
          if (!candidateDate) return false;
          
          const candidateDateObj = new Date(candidateDate);
          return candidateDateObj >= monthInfo.startDate && candidateDateObj <= monthInfo.endDate;
        });
      }

      console.log(`Month ${monthInfo.monthName} candidates:`, monthCandidates.length);

      // Count by status categories
      const statusCounts = {
        Attended: 0,
        'Client Conf Pending': 0,
        Confirmed: 0,
        'Not Attended': 0,
        'Not Interested': 0,
        'Position Hold': 0,
        Reschedule: 0,
        'Yet to Confirm': 0
      };

      monthCandidates.forEach(candidate => {
        console.log(`Candidate ${candidate.name} has status1: ${candidate.status1}`);
        
        // Check each category using status1
        const categories = ['Attended', 'Client Conf Pending', 'Confirmed', 'Not Attended', 'Not Interested', 'Position Hold', 'Reschedule', 'Yet to Confirm'];
        let categorized = false;
        
        for (const category of categories) {
          if (checkCandidateStatus(candidate, category)) {
            statusCounts[category as keyof typeof statusCounts]++;
            categorized = true;
            console.log(`Categorized as ${category}`);
            break;
          }
        }
        
        // Log if not categorized (this should rarely happen now)
        if (!categorized) {
          console.log(`Status1 '${candidate.status1}' not recognized for candidate ${candidate.name}`);
        }
      });

      console.log(`${monthInfo.monthName} status counts:`, statusCounts);

      return {
        month: monthInfo.monthName,
        ...statusCounts
      };
    });

    // If using date range from parent, return the monthly data as-is
    // (the date filtering was already applied in the monthlyData processing above)

    console.log('Final monthly data:', monthlyData);
    return monthlyData;
  }, [candidates, finalSelectedClients, finalSelectedRecruiters, finalSelectedManagers, timeRange, customDateRange, dateRange]);

  // Calculate percentage data for Report2b
  const attendedCasesPercentageData = useMemo((): AttendedCasesData[] => {
    return attendedCasesData.map(monthData => {
      const total = monthData.Attended + monthData['Client Conf Pending'] + monthData.Confirmed + 
                   monthData['Not Attended'] + monthData['Not Interested'] + monthData['Position Hold'] +
                   monthData.Reschedule + monthData['Yet to Confirm'];
      
      if (total === 0) {
        return {
          ...monthData,
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
      
      return {
        month: monthData.month,
        Attended: Math.round((monthData.Attended / total) * 100),
        'Client Conf Pending': Math.round((monthData['Client Conf Pending'] / total) * 100),
        Confirmed: Math.round((monthData.Confirmed / total) * 100),
        'Not Attended': Math.round((monthData['Not Attended'] / total) * 100),
        'Not Interested': Math.round((monthData['Not Interested'] / total) * 100),
        'Position Hold': Math.round((monthData['Position Hold'] / total) * 100),
        Reschedule: Math.round((monthData.Reschedule / total) * 100),
        'Yet to Confirm': Math.round((monthData['Yet to Confirm'] / total) * 100)
      };
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
      {/* Show filters only if not controlled by parent */}
      {selectedClients.length === 0 && selectedRecruiters.length === 0 && selectedManagers.length === 0 && !dateRange && (
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
                managers={managers}
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
      )}

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
            title="Interview Cases - Counts"
            description="Monthly breakdown of interview outcomes (absolute numbers)"
          />
        </TabsContent>

        <TabsContent value="percentages" className="space-y-6">
          <AttendedCasesChart
            data={attendedCasesPercentageData}
            isPercentage={true}
            onExportExcel={() => handleExportExcel(true)}
            title="Report2b: Attended Cases - Percentages"
            description="Monthly breakdown of interview outcomes (percentage distribution)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendedCasesReports;
