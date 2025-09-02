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
  Documentation: number;
  Drop: number;
  'Feedback Awaited': number;
  'Final Reject': number;
  Hold: number;
  'Interview Reject': number;
  Joined: number;
  Offered: number;
  'Offered Drop': number;
  Selected: number;
  Shortlisted: number;
  'SL-2+': number;
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

  // Status checking function based on status2 field
  const checkCandidateStatus = (candidate: Candidate, category: string): boolean => {
    switch (category) {
      case 'Documentation':
        return candidate.status2 === 'Documentation';
      case 'Drop':
        return candidate.status2 === 'Drop';
      case 'Feedback Awaited':
        return candidate.status2 === 'Feedback Awaited';
      case 'Final Reject':
        return candidate.status2 === 'Final Reject';
      case 'Hold':
        return candidate.status2 === 'Hold';
      case 'Interview Reject':
        return candidate.status2 === 'Interview Reject';
      case 'Joined':
        return candidate.status2 === 'Joined';
      case 'Offered':
        return candidate.status2 === 'Offered';
      case 'Offered Drop':
        return candidate.status2 === 'Offered Drop';
      case 'Selected':
        return candidate.status2 === 'Selected';
      case 'Shortlisted':
        return candidate.status2 === 'Shortlisted';
      case 'SL-2+':
        // Special logic: sum of Shortlisted + Documentation
        return candidate.status2 === 'Shortlisted' || candidate.status2 === 'Documentation';
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

    // Process data by month
    const monthlyData = months.map(monthInfo => {
      let monthCandidates;
      
      if (dateRange?.from && dateRange?.to) {
        // If parent date range is provided, filter by the parent date range using interview date
        monthCandidates = filteredCandidates.filter(candidate => {
          const candidateDate = candidate.interviewDate;
          if (!candidateDate) return false;
          
          const candidateDateObj = new Date(candidateDate);
          return candidateDateObj >= dateRange.from! && candidateDateObj <= dateRange.to!;
        });
      } else {
        // Otherwise, filter by month using interview date
        monthCandidates = filteredCandidates.filter(candidate => {
          const candidateDate = candidate.interviewDate;
          if (!candidateDate) return false;
          
          const candidateDateObj = new Date(candidateDate);
          return candidateDateObj >= monthInfo.startDate && candidateDateObj <= monthInfo.endDate;
        });
      }

      console.log(`Month ${monthInfo.monthName} candidates:`, monthCandidates.length);

      // Count by status2 categories
      const statusCounts = {
        Documentation: 0,
        Drop: 0,
        'Feedback Awaited': 0,
        'Final Reject': 0,
        Hold: 0,
        'Interview Reject': 0,
        Joined: 0,
        Offered: 0,
        'Offered Drop': 0,
        Selected: 0,
        Shortlisted: 0,
        'SL-2+': 0
      };

      monthCandidates.forEach(candidate => {
        const status2 = candidate.status2;
        
        // Count individual status2 categories
        if (status2 === 'Documentation') {
          statusCounts.Documentation++;
          statusCounts['SL-2+']++; // Also count for SL-2+
        } else if (status2 === 'Drop') {
          statusCounts.Drop++;
        } else if (status2 === 'Feedback Awaited') {
          statusCounts['Feedback Awaited']++;
        } else if (status2 === 'Final Reject') {
          statusCounts['Final Reject']++;
        } else if (status2 === 'Hold') {
          statusCounts.Hold++;
        } else if (status2 === 'Interview Reject') {
          statusCounts['Interview Reject']++;
        } else if (status2 === 'Joined') {
          statusCounts.Joined++;
        } else if (status2 === 'Offered') {
          statusCounts.Offered++;
        } else if (status2 === 'Offered Drop') {
          statusCounts['Offered Drop']++;
        } else if (status2 === 'Selected') {
          statusCounts.Selected++;
        } else if (status2 === 'Shortlisted') {
          statusCounts.Shortlisted++;
          statusCounts['SL-2+']++; // Also count for SL-2+
        }
      });

      console.log(`${monthInfo.monthName} status counts:`, statusCounts);

      return {
        month: monthInfo.monthName,
        ...statusCounts
      };
    });

    console.log('Final monthly data:', monthlyData);
    return monthlyData;
  }, [candidates, finalSelectedClients, finalSelectedRecruiters, finalSelectedManagers, timeRange, customDateRange, dateRange]);

  // Calculate percentage data
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
          Documentation: 0,
          Drop: 0,
          'Feedback Awaited': 0,
          'Final Reject': 0,
          Hold: 0,
          'Interview Reject': 0,
          Joined: 0,
          Offered: 0,
          'Offered Drop': 0,
          Selected: 0,
          Shortlisted: 0,
          'SL-2+': 0
        };
      }
      
      // Calculate percentages for each category
      const percentageData = {
        month: monthData.month,
        Documentation: Math.round((monthData.Documentation / total) * 100),
        Drop: Math.round((monthData.Drop / total) * 100),
        'Feedback Awaited': Math.round((monthData['Feedback Awaited'] / total) * 100),
        'Final Reject': Math.round((monthData['Final Reject'] / total) * 100),
        Hold: Math.round((monthData.Hold / total) * 100),
        'Interview Reject': Math.round((monthData['Interview Reject'] / total) * 100),
        Joined: Math.round((monthData.Joined / total) * 100),
        Offered: Math.round((monthData.Offered / total) * 100),
        'Offered Drop': Math.round((monthData['Offered Drop'] / total) * 100),
        Selected: Math.round((monthData.Selected / total) * 100),
        Shortlisted: Math.round((monthData.Shortlisted / total) * 100),
        'SL-2+': Math.round((monthData['SL-2+'] / total) * 100)
      };
      
      console.log(`Month ${monthData.month} percentages:`, percentageData);
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
      'Documentation': isPercentage ? `${item.Documentation}%` : item.Documentation,
      'Drop': isPercentage ? `${item.Drop}%` : item.Drop,
      'Feedback Awaited': isPercentage ? `${item['Feedback Awaited']}%` : item['Feedback Awaited'],
      'Final Reject': isPercentage ? `${item['Final Reject']}%` : item['Final Reject'],
      'Hold': isPercentage ? `${item.Hold}%` : item.Hold,
      'Interview Reject': isPercentage ? `${item['Interview Reject']}%` : item['Interview Reject'],
      'Joined': isPercentage ? `${item.Joined}%` : item.Joined,
      'Offered': isPercentage ? `${item.Offered}%` : item.Offered,
      'Offered Drop': isPercentage ? `${item['Offered Drop']}%` : item['Offered Drop'],
      'Selected': isPercentage ? `${item.Selected}%` : item.Selected,
      'Shortlisted': isPercentage ? `${item.Shortlisted}%` : item.Shortlisted,
      'SL-2+': isPercentage ? `${item['SL-2+']}%` : item['SL-2+']
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
            title="Attended Cases – Overview"
            description="Monthly breakdown of interview outcomes based on status2 field (absolute numbers)"
          />
        </TabsContent>

        <TabsContent value="percentages" className="space-y-6">
          <AttendedCasesChart
            data={attendedCasesPercentageData}
            isPercentage={true}
            onExportExcel={() => handleExportExcel(true)}
            title="Attended Cases – Overview (Percentage)"
            description="Monthly breakdown of interview outcomes based on status2 field (percentage distribution)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendedCasesReports;
