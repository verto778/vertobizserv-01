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
  Rejected: number;
  'SL-2ndRound+': number;
  'Selected/Offered': number;
  'FeedbackAwaited': number;
  Others: number;
}

interface AttendedCasesReportsProps {
  selectedClients?: string[];
  selectedRecruiters?: string[];
  dateRange?: { from?: Date; to?: Date };
}

const AttendedCasesReports: React.FC<AttendedCasesReportsProps> = ({
  selectedClients = [],
  selectedRecruiters = [],
  dateRange
}) => {
  const [localSelectedClients, setLocalSelectedClients] = useState<string[]>([]);
  const [localSelectedRecruiters, setLocalSelectedRecruiters] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('6'); // Default 6 months
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  
  const { candidates } = useCandidateManagement();
  const { clients } = useClientData();
  const { recruiters } = useRecruiters(true);
  const { exportToExcel } = useFilteredData();

  // Use props if provided, otherwise use local state
  const finalSelectedClients = selectedClients.length > 0 ? selectedClients : localSelectedClients;
  const finalSelectedRecruiters = selectedRecruiters.length > 0 ? selectedRecruiters : localSelectedRecruiters;

  // Custom status checking function based on user requirements - matching InterviewConversionReport logic
  const checkCandidateStatus = (candidate: Candidate, category: string): boolean => {
    switch (category) {
      case 'Attended':
        // Show whose status1 is 'Attended' (ignore status2)
        return candidate.status1 === 'Attended';
        
      case 'Rejected':
        // Show sum of Interview Reject and Final Reject from status2
        return candidate.status2 === 'Interview Reject' || candidate.status2 === 'Final Reject';
        
      case 'SL-2ndRound+':
        // Show candidates whose round is 2+ AND status2 is 'Selected'
        const round = parseInt(candidate.interviewRound || '1');
        return round >= 2 && candidate.status2 === 'Selected';
        
      case 'Selected/Offered':
        // Show whose status2 is either 'Selected' or 'Offered'
        return candidate.status2 === 'Selected' || candidate.status2 === 'Offered';
        
      case 'FeedbackAwaited':
        // Show whose status2 is 'Feedback Awaited' (ignore status1)
        return candidate.status2 === 'Feedback Awaited';
        
      case 'Others':
        // Everything else not covered by above categories - avoid recursive calls
        return candidate.status1 !== 'Attended' &&
               !(candidate.status2 === 'Interview Reject' || candidate.status2 === 'Final Reject') &&
               !(parseInt(candidate.interviewRound || '1') >= 2 && candidate.status2 === 'Selected') &&
               !(candidate.status2 === 'Selected' || candidate.status2 === 'Offered') &&
               candidate.status2 !== 'Feedback Awaited';
        
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
        Rejected: 0,
        'SL-2ndRound+': 0,
        'Selected/Offered': 0,
        'FeedbackAwaited': 0,
        Others: 0
      };

      monthCandidates.forEach(candidate => {
        console.log(`Candidate ${candidate.name} has status1: ${candidate.status1}, status2: ${candidate.status2}`);
        
        // Check each category using the new logic - prioritize status2 checks over status1
        const categories = ['Rejected', 'FeedbackAwaited', 'SL-2ndRound+', 'Selected/Offered', 'Attended'];
        let categorized = false;
        
        for (const category of categories) {
          if (checkCandidateStatus(candidate, category)) {
            statusCounts[category as keyof typeof statusCounts]++;
            categorized = true;
            console.log(`Categorized as ${category}`);
            break;
          }
        }
        
        // If not categorized in any specific category, put in Others
        if (!categorized) {
          statusCounts.Others++;
          console.log(`Put in Others category`);
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
  }, [candidates, finalSelectedClients, finalSelectedRecruiters, timeRange, customDateRange, dateRange]);

  // Calculate percentage data for Report2b
  const attendedCasesPercentageData = useMemo((): AttendedCasesData[] => {
    return attendedCasesData.map(monthData => {
      const total = monthData.Attended + monthData.Rejected + monthData['SL-2ndRound+'] + 
                   monthData['Selected/Offered'] + monthData['FeedbackAwaited'] + monthData.Others;
      
      if (total === 0) {
        return {
          ...monthData,
          Attended: 0,
          Rejected: 0,
          'SL-2ndRound+': 0,
          'Selected/Offered': 0,
          'FeedbackAwaited': 0,
          Others: 0
        };
      }
      
      return {
        month: monthData.month,
        Attended: Math.round((monthData.Attended / total) * 100),
        Rejected: Math.round((monthData.Rejected / total) * 100),
        'SL-2ndRound+': Math.round((monthData['SL-2ndRound+'] / total) * 100),
        'Selected/Offered': Math.round((monthData['Selected/Offered'] / total) * 100),
        'FeedbackAwaited': Math.round((monthData['FeedbackAwaited'] / total) * 100),
        Others: Math.round((monthData.Others / total) * 100)
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
      'Rejected': isPercentage ? `${item.Rejected}%` : item.Rejected,
      'SL-2nd Round+': isPercentage ? `${item['SL-2ndRound+']}%` : item['SL-2ndRound+'],
      'Selected/Offered': isPercentage ? `${item['Selected/Offered']}%` : item['Selected/Offered'],
      'Feedback Awaited': isPercentage ? `${item['FeedbackAwaited']}%` : item['FeedbackAwaited'],
      'Others': isPercentage ? `${item.Others}%` : item.Others
    }));

    const fileName = `attended-cases-${isPercentage ? 'percentage' : 'count'}-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToExcel(exportData, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Show filters only if not controlled by parent */}
      {selectedClients.length === 0 && selectedRecruiters.length === 0 && !dateRange && (
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
                selectedClients={localSelectedClients}
                selectedRecruiters={localSelectedRecruiters}
                onClientsChange={setLocalSelectedClients}
                onRecruitersChange={setLocalSelectedRecruiters}
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
            title="Report2a: Attended Cases - Counts"
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
