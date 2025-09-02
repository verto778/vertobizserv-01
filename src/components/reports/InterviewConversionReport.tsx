import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Filter, BarChart3, TrendingUp, Calendar, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCandidateManagement } from '@/hooks/useCandidateManagement';
import { useClientData } from '@/hooks/useClientData';
import { useRecruiters } from '@/hooks/useRecruiters';
import { useFilteredData } from '@/hooks/useFilteredData';
import { toast } from '@/hooks/use-toast';
import { getMonth, getYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Candidate } from '@/components/candidates/types';
import InterviewConversionChart from './InterviewConversionChart';
import MonthlyOutcomeCharts from './MonthlyOutcomeCharts';
import AttendedCasesReports from './AttendedCasesReports';
import ConversionTrendsChart from './ConversionTrendsChart';
import MonthlyBreakdownChart from './MonthlyBreakdownChart';
import ReportFilters from './ReportFilters';

// Define types for the report data
interface StatusCounts {
  [key: string]: number;
}

interface ConversionDataItem {
  year: number;
  month: string;
  totalInterviews: number;
  statusCounts: StatusCounts;
  candidates: Candidate[];
}

interface PercentageDataItem extends ConversionDataItem {
  percentages: {
    [key: string]: string;
  };
}

const InterviewConversionReport: React.FC = () => {
  // Initialize with empty arrays for filters (no filtering applied)
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  
  // Initialize with undefined for date range (no filtering applied initially)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const { candidates } = useCandidateManagement();
  const { clients } = useClientData();
  const { recruiters } = useRecruiters(true);
  const { exportToExcel } = useFilteredData();

  // Get unique managers from candidates data
  const managers = useMemo(() => {
    const uniqueManagers = new Set<string>();
    candidates.forEach(candidate => {
      if (candidate.manager && candidate.manager.trim() !== '') {
        uniqueManagers.add(candidate.manager);
      }
    });
    return Array.from(uniqueManagers).map(name => ({ id: name, name }));
  }, [candidates]);

  // Custom status checking functions based on user requirements
  const checkCandidateStatus = (candidate: Candidate, category: string): boolean => {
    const round = parseInt(candidate.interviewRound || '1');
    
    switch (category) {
      case 'Attended':
        // Show whose status1 is 'Attended' (ignore status2)
        return candidate.status1 === 'Attended';
        
      case 'Rejected':
        // Show sum of Interview Reject and Final Reject from status2
        return candidate.status2 === 'Interview Reject' || candidate.status2 === 'Final Reject';
        
      case 'SL -2nd Round+':
        // Show candidates whose round is 2+ AND status2 is 'Selected' (exclusive check)
        return round >= 2 && candidate.status2 === 'Selected';
        
      case 'Selected / Offered':
        // Show whose status2 is 'Selected' (but NOT in round 2+) or 'Offered'
        // This ensures no overlap with 'SL -2nd Round+' category
        return (candidate.status2 === 'Selected' && round < 2) || candidate.status2 === 'Offered';
        
      case 'Feedback Awaited':
        // Show whose status2 is 'Feedback Awaited' (ignore status1)
        return candidate.status2 === 'Feedback Awaited';
        
      case 'Others':
        // Everything else not covered by above categories
        return candidate.status1 !== 'Attended' &&
               !(candidate.status2 === 'Interview Reject' || candidate.status2 === 'Final Reject') &&
               !(round >= 2 && candidate.status2 === 'Selected') &&
               !((candidate.status2 === 'Selected' && round < 2) || candidate.status2 === 'Offered') &&
               candidate.status2 !== 'Feedback Awaited';
        
      default:
        return false;
    }
  };

  // Define status categories for the report
  const statusCategories = ['Attended', 'Rejected', 'SL -2nd Round+', 'Selected / Offered', 'Feedback Awaited', 'Others'];

  // Process candidates data for conversion analysis
  const conversionData = useMemo((): ConversionDataItem[] => {
    let filteredCandidates = candidates.filter(candidate => {
      // Filter by selected clients
      if (selectedClients.length > 0 && !selectedClients.includes(candidate.clientName)) {
        return false;
      }
      
      // Filter by selected recruiters
      if (selectedRecruiters.length > 0 && !selectedRecruiters.includes(candidate.recruiterName)) {
        return false;
      }
      
      // Filter by selected managers
      if (selectedManagers.length > 0 && !selectedManagers.includes(candidate.manager || '')) {
        return false;
      }
      
      return true;
    });

    // Apply date filtering based on date range using interviewDate column
    if (dateRange?.from && dateRange?.to) {
      filteredCandidates = filteredCandidates.filter(candidate => {
        const candidateDate = candidate.interviewDate;
        if (!candidateDate) return false;
        
        const candidateDateObj = new Date(candidateDate);
        return candidateDateObj >= dateRange.from! && candidateDateObj <= dateRange.to!;
      });
    }

    // Group candidates by month
    const monthlyGroups: { [key: string]: Candidate[] } = {};
    
    filteredCandidates.forEach(candidate => {
      const candidateDate = candidate.interviewDate;
      if (!candidateDate) return;
      
      const date = new Date(candidateDate);
      const monthKey = `${getYear(date)}-${getMonth(date) + 1}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(candidate);
    });

    // Convert to array format
    const monthlyData = Object.entries(monthlyGroups).map(([monthKey, monthCandidates]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = format(new Date(year, month - 1), 'MMM yyyy');

      // Count by status categories using new logic
      const statusCounts: StatusCounts = {};
      statusCategories.forEach(category => {
        statusCounts[category] = monthCandidates.filter(candidate => 
          checkCandidateStatus(candidate, category)
        ).length;
      });

      const totalInterviews = monthCandidates.length;

      return {
        year,
        month: monthName,
        totalInterviews,
        statusCounts,
        candidates: monthCandidates
      };
    });

    // Sort by year and month
    return monthlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    });
  }, [candidates, selectedClients, selectedRecruiters, selectedManagers, dateRange]);

  // Process status2 data for overview chart
  const status2OverviewData = useMemo(() => {
    const currentDate = new Date();
    let months = [];
    
    // Generate months array for last 6 months
    for (let i = 0; i < 6; i++) {
      const date = subMonths(currentDate, i);
      months.unshift({
        year: getYear(date),
        month: getMonth(date) + 1,
        monthName: format(date, 'MMM yyyy'),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      });
    }

    // Filter candidates
    let filteredCandidates = candidates.filter(candidate => {
      if (selectedClients.length > 0 && !selectedClients.includes(candidate.clientName)) {
        return false;
      }
      if (selectedRecruiters.length > 0 && !selectedRecruiters.includes(candidate.recruiterName)) {
        return false;
      }
      if (selectedManagers.length > 0 && !selectedManagers.includes(candidate.manager || '')) {
        return false;
      }
      return true;
    });

    // Apply date range filter if provided
    if (dateRange?.from && dateRange?.to) {
      filteredCandidates = filteredCandidates.filter(candidate => {
        const candidateDate = candidate.interviewDate;
        if (!candidateDate) return false;
        const candidateDateObj = new Date(candidateDate);
        return candidateDateObj >= dateRange.from! && candidateDateObj <= dateRange.to!;
      });
    }

    return months.map(monthInfo => {
      let monthCandidates;
      
      if (dateRange?.from && dateRange?.to) {
        // If date range is provided, use all filtered candidates
        monthCandidates = filteredCandidates;
      } else {
        // Otherwise, filter by month
        monthCandidates = filteredCandidates.filter(candidate => {
          const candidateDate = candidate.interviewDate;
          if (!candidateDate) return false;
          const candidateDateObj = new Date(candidateDate);
          return candidateDateObj >= monthInfo.startDate && candidateDateObj <= monthInfo.endDate;
        });
      }

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
        
        if (status2 === 'Documentation') {
          statusCounts.Documentation++;
          statusCounts['SL-2+']++;
        } else if (status2 === 'Shortlisted') {
          statusCounts.Shortlisted++;
          statusCounts['SL-2+']++;
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
        }
      });

      return {
        month: monthInfo.monthName,
        ...statusCounts
      };
    });
  }, [candidates, selectedClients, selectedRecruiters, selectedManagers, dateRange]);

  // Calculate percentage data
  const percentageData = useMemo((): PercentageDataItem[] => {
    return conversionData.map(monthData => {
      const percentages: { [key: string]: string } = {};
      statusCategories.forEach(category => {
        const count = monthData.statusCounts[category] || 0;
        const total = monthData.totalInterviews;
        percentages[category] = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      });

      return {
        ...monthData,
        percentages
      };
    });
  }, [conversionData]);

  // Handle date range reset
  const handleDateReset = () => {
    setDateRange(undefined);
    toast({
      title: "Date range reset",
      description: "Date range has been cleared. Showing all data.",
    });
  };

  // Handle Excel export
  const handleExportExcel = (isPercentage = false) => {
    const dataToExport = isPercentage ? percentageData : conversionData;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters to include data.",
        variant: "destructive"
      });
      return;
    }

    const exportData = dataToExport.map(item => {
      const row: { [key: string]: any } = {
        'Year': item.year,
        'Month': item.month,
        'Total Interview Cases': item.totalInterviews
      };

      statusCategories.forEach(category => {
        if (isPercentage && 'percentages' in item) {
          row[`${category} %`] = item.percentages[category] + '%';
        } else {
          row[category] = item.statusCounts[category] || 0;
        }
      });

      return row;
    });

    const fileName = `interview-conversion-${isPercentage ? 'percentage' : 'count'}-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToExcel(exportData, fileName);
  };

  const handleStatus2ExportExcel = () => {
    if (status2OverviewData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters to include data.",
        variant: "destructive"
      });
      return;
    }

    const exportData = status2OverviewData.map(item => ({
      'Month': item.month,
      'Documentation': item.Documentation,
      'Drop': item.Drop,
      'Feedback Awaited': item['Feedback Awaited'],
      'Final Reject': item['Final Reject'],
      'Hold': item.Hold,
      'Interview Reject': item['Interview Reject'],
      'Joined': item.Joined,
      'Offered': item.Offered,
      'Offered Drop': item['Offered Drop'],
      'Selected': item.Selected,
      'Shortlisted': item.Shortlisted,
      'SL-2+': item['SL-2+']
    }));

    const fileName = `status2-overview-report-${format(new Date(), 'yyyy-MM-dd')}`;
    exportToExcel(exportData, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Main Content Tabs */}
      <Tabs defaultValue="attended-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attended-cases" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Interview Cases
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Attended Cases
          </TabsTrigger>
          <TabsTrigger value="monthly-charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monthly Outcomes
          </TabsTrigger>
          <TabsTrigger value="conversion-trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Conversion Trends
          </TabsTrigger>
          <TabsTrigger value="monthly-breakdown" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monthly Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attended-cases" className="space-y-6">
          <AttendedCasesReports 
            selectedClients={selectedClients}
            selectedRecruiters={selectedRecruiters}
            selectedManagers={selectedManagers}
            dateRange={dateRange}
            managers={managers}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <InterviewConversionChart 
            data={status2OverviewData} 
            onExportExcel={handleStatus2ExportExcel}
          />
        </TabsContent>

        <TabsContent value="monthly-charts" className="space-y-6">
          <MonthlyOutcomeCharts 
            data={conversionData} 
            statusCategories={statusCategories}
            onExportExcel={handleExportExcel}
          />
        </TabsContent>

        <TabsContent value="conversion-trends" className="space-y-6">
          <ConversionTrendsChart 
            data={conversionData} 
            onExportExcel={handleExportExcel}
          />
        </TabsContent>

        <TabsContent value="monthly-breakdown" className="space-y-6">
          <MonthlyBreakdownChart 
            data={conversionData} 
            onExportExcel={handleExportExcel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewConversionReport;
