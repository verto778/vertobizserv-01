import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart3, Table2, Grid3X3 } from 'lucide-react';
import { useFilteredData } from '@/hooks/useFilteredData';
import { useCandidateManagement } from '@/hooks/useCandidateManagement';
import { useClientData } from '@/hooks/useClientData';
import { useRecruiters } from '@/hooks/useRecruiters';
import ReportFilters from './ReportFilters';
import ChartCarousel from './ChartCarousel';
import InteractiveDataTable from './InteractiveDataTable';
import PendingActionTable from './PendingActionTable';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';

export interface PendingActionData {
  id: string;
  candidateName: string;
  clientName: string;
  recruiterName: string;
  position: string;
  status: string;
  daysPending: number;
  timePeriod: string;
  lastUpdated: Date;
  interviewDate: Date | null;
}

const PendingActionReport: React.FC = () => {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  
  const { candidates, loading } = useCandidateManagement();
  const { clients } = useClientData();
  const { recruiters } = useRecruiters(true);
  const { exportToExcel } = useFilteredData();

  // Debug logging for data fetching
  useEffect(() => {
    console.log('📊 PendingActionReport - Data Status:', {
      totalCandidates: candidates.length,
      isLoading: loading,
      hasClients: clients.length > 0,
      hasRecruiters: recruiters.length > 0
    });
  }, [candidates.length, loading, clients.length, recruiters.length]);

  // Process candidates data for pending actions with enhanced logic
  const pendingActionData = useMemo(() => {
    const today = new Date();
    
    // Define pending statuses that require action from status1
    const pendingStatus1 = [
      'Client Conf Pending', 
      'Yet to Confirm', 
      'Not Attended', 
      'Reschedule'
    ];
    
    // Define pending statuses that require action from status2
    const pendingStatus2 = [
      'Feedback Awaited'
    ];
    
    console.log('🔄 Processing candidates for pending actions...');
    console.log('📋 Available candidates:', candidates.length);
    
    const filteredCandidates = candidates.filter(candidate => {
      // Check if candidate has pending status in either status1 or status2
      const isPendingStatus1 = pendingStatus1.includes(candidate.status1);
      const isPendingStatus2 = pendingStatus2.includes(candidate.status2);
      const isPending = isPendingStatus1 || isPendingStatus2;
      
      const matchesClient = selectedClients.length === 0 || selectedClients.includes(candidate.clientName);
      const matchesRecruiter = selectedRecruiters.length === 0 || selectedRecruiters.includes(candidate.recruiterName);
      
      if (!isPending) {
        console.log(`❌ Candidate ${candidate.name} - Status1 '${candidate.status1}', Status2 '${candidate.status2}' not pending`);
      }
      
      return isPending && matchesClient && matchesRecruiter;
    });
    
    console.log('✅ Filtered pending candidates:', filteredCandidates.length);
    
    const processedData: PendingActionData[] = [];
    
    filteredCandidates.forEach(candidate => {
      const createEntry = (statusToUse: string, isStatus1: boolean) => {
        let referenceDate: Date;
        
        if (isStatus1) {
          // For status1 pending statuses
          if (candidate.status1 === 'Client Conf Pending') {
            referenceDate = candidate.dateInformed || candidate.interviewDate || new Date();
            console.log(`📅 Client Conf Pending - ${candidate.name}: Using dateInformed ${referenceDate}`);
          } else {
            referenceDate = candidate.interviewDate || candidate.dateInformed || new Date();
            console.log(`📅 Status1 - ${candidate.name}: Using interviewDate ${referenceDate}`);
          }
        } else {
          // For status2 pending statuses (like Feedback Awaited)
          referenceDate = candidate.interviewDate || candidate.dateInformed || new Date();
          console.log(`📅 Status2 - ${candidate.name}: Using interviewDate for ${statusToUse} ${referenceDate}`);
        }
        
        let daysPending = differenceInDays(today, referenceDate);
        
        // Ensure days pending is not negative
        if (daysPending < 0) {
          daysPending = 0;
        }
        
        // Categorize into time periods
        let timePeriod = '';
        if (daysPending <= 7) timePeriod = 'Below 7 days';
        else if (daysPending <= 15) timePeriod = '8-15 days';
        else if (daysPending <= 30) timePeriod = '16-30 days';
        else if (daysPending <= 60) timePeriod = '31-60 days';
        else timePeriod = 'Above 60 days';

        return {
          id: `${candidate.id}-${statusToUse}`,
          candidateName: candidate.name,
          clientName: candidate.clientName,
          recruiterName: candidate.recruiterName,
          position: candidate.position,
          status: statusToUse,
          daysPending,
          timePeriod,
          lastUpdated: candidate.dateInformed || new Date(),
          interviewDate: candidate.interviewDate,
        };
      };

      // Process status1 if it's pending
      if (pendingStatus1.includes(candidate.status1)) {
        processedData.push(createEntry(candidate.status1, true));
      }
      
      // Process status2 if it's pending
      if (pendingStatus2.includes(candidate.status2)) {
        processedData.push(createEntry(candidate.status2, false));
      }
    });
    
    console.log('📊 Final processed data:', processedData.length, 'records');
    
    // Log distribution by status
    const statusDistribution = processedData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Status distribution:', statusDistribution);
    
    return processedData;
  }, [candidates, selectedClients, selectedRecruiters]);

  // Create chart data with enhanced mapping - this handles both status1 and status2
  const chartData = useMemo(() => {
    // Map database status values to display names - including both status1 and status2
    const statusMapping = {
      'Client Conf Pending': 'Client Confirmation',
      'Yet to Confirm': 'Yet to Confirm', 
      'Not Attended': 'Not Attended',
      'Reschedule': 'Reschedule',
      'Feedback Awaited': 'Feedback Awaited' // This comes from status2
    };
    
    const displayStatuses = Object.values(statusMapping);
    const timePeriods = ['Below 7 days', '8-15 days', '16-30 days', '31-60 days', 'Above 60 days'];
    
    const chartResult = displayStatuses.map(displayStatus => {
      const statusData: any = { 
        status: displayStatus
      };
      
      // Find the database status that maps to this display status
      const dbStatus = Object.keys(statusMapping).find(key => statusMapping[key] === displayStatus);
      
      timePeriods.forEach(period => {
        const count = pendingActionData.filter(
          item => item.status === dbStatus && item.timePeriod === period
        ).length;
        
        // Convert period names to match chart config keys
        const periodKey = period.replace(/\s+/g, '_').replace('-', '_');
        statusData[periodKey] = count;
      });
      
      return statusData;
    });
    
    console.log('📊 Chart data prepared:', chartResult.length, 'status categories');
    return chartResult;
  }, [pendingActionData]);

  const createExcelData = () => {
    const statusMapping = {
      'Client Conf Pending': 'Client Confirmation',
      'Yet to Confirm': 'Yet to Confirm', 
      'Not Attended': 'Not Attended',
      'Reschedule': 'Reschedule',
      'Feedback Awaited': 'Feedback Awaited'
    };
    
    const displayStatuses = ['Client Confirmation', 'Yet to Confirm', 'Not Attended', 'Reschedule', 'Feedback Awaited'];
    const timePeriods = ['Below 7 days', '8-15 days', '16-30 days', '31-60 days', 'Above 60 days'];
    
    return displayStatuses.map(displayStatus => {
      const row: any = { 'Interview Status': displayStatus };
      
      const dbStatus = Object.keys(statusMapping).find(key => statusMapping[key] === displayStatus);
      
      timePeriods.forEach(period => {
        const count = pendingActionData.filter(
          item => item.status === dbStatus && item.timePeriod === period
        ).length;
        row[period] = count;
      });
      
      return row;
    });
  };

  const handleExportExcel = () => {
    if (pendingActionData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters to include data.",
        variant: "destructive"
      });
      return;
    }

    const excelData = createExcelData();
    const fileName = `interview-status-report-${format(new Date(), 'yyyy-MM-dd')}`;
    
    exportToExcel(excelData, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportFilters
        clients={clients}
        recruiters={recruiters}
        selectedClients={selectedClients}
        selectedRecruiters={selectedRecruiters}
        onClientsChange={setSelectedClients}
        onRecruitersChange={setSelectedRecruiters}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Interactive Charts
          </TabsTrigger>
          <TabsTrigger value="data-table" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Data Explorer
          </TabsTrigger>
          <TabsTrigger value="detailed-table" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Detailed Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <ChartCarousel data={chartData} />
          
          <div className="flex justify-end">
            <Button onClick={handleExportExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="data-table" className="space-y-6">
          <InteractiveDataTable data={chartData} />
        </TabsContent>

        <TabsContent value="detailed-table" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Candidate Records</CardTitle>
              <CardDescription>
                Complete list of all candidates with pending actions ({pendingActionData.length} records)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingActionTable data={pendingActionData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PendingActionReport;
