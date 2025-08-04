
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DateRange } from 'react-day-picker';
import { toast } from '@/hooks/use-toast';
import { useFilteredData, FilteredDataOptions } from '@/hooks/useFilteredData';
import DataDisplaySettings from '@/components/settings/DataDisplaySettings';
import ExportData from '@/components/settings/ExportData';

const Settings = () => {
  const [timePeriod, setTimePeriod] = useState('30');
  const [dataType, setDataType] = useState<'candidates' | 'clients'>('candidates');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);
  const [selectedMonthValue, setSelectedMonthValue] = useState<number | undefined>(undefined);
  const [selectedYearValue, setSelectedYearValue] = useState<number | undefined>(undefined);
  const [exportType, setExportType] = useState<'range' | 'month'>('month');
  
  const { isLoading, data, fetchData, exportToExcel } = useFilteredData();
  
  // Applying filters when settings change
  const handleApplySettings = () => {
    const options: FilteredDataOptions = {
      dataType,
      dateRange,
      timePeriod
    };
    fetchData(options);
    
    const periodLabel = timePeriod === '180-entire' ? '6 months (entire date range)' : `${timePeriod} days`;
    toast({
      title: "Settings Applied",
      description: `Data will now display for the last ${periodLabel}`,
    });
  };
  
  // For initial load
  useEffect(() => {
    handleApplySettings();
  }, []);
  
  const handleExport = async () => {
    let exportOptions: FilteredDataOptions;
    
    if (exportType === 'range') {
      // Validation for date range export
      if (!dateRange?.from || !dateRange?.to) {
        toast({
          title: "Date range not selected",
          description: "Please select both start and end dates for export.",
          variant: "destructive"
        });
        return;
      }
      
      exportOptions = {
        dataType,
        dateRange,
        timePeriod,
        exportType: 'range'
      };
    } else {
      // Validation for month export
      if (!selectedYearValue) {
        toast({
          title: "Year not selected",
          description: "Please select a year for export.",
          variant: "destructive"
        });
        return;
      }

      exportOptions = {
        dataType,
        dateRange,
        timePeriod,
        selectedMonth: selectedMonth,
        exportType: 'month',
        selectedMonthValue: selectedMonthValue,
        selectedYearValue: selectedYearValue
      };
    }
    
    try {
      const exportData = await fetchData(exportOptions);
      
      if (!exportData || exportData.length === 0) {
        toast({
          title: "No data available",
          description: "No data found for the selected period.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate filename based on selection
      let fileName: string = dataType;
      if (exportType === 'range' && dateRange?.from && dateRange?.to) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = dateRange.to.toISOString().split('T')[0];
        fileName = `${dataType}_${fromDate}_to_${toDate}`;
      } else if (exportType === 'month' && selectedYearValue) {
        if (selectedMonthValue) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          fileName = `${dataType}_${monthNames[selectedMonthValue - 1]}_${selectedYearValue}`;
        } else {
          fileName = `${dataType}_${selectedYearValue}`;
        }
      }
      
      exportToExcel(exportData, fileName);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <div className="h-1 w-20 bg-primary/20 rounded-full ml-4"></div>
          </div>
          
          <div className="flex flex-col space-y-8 w-full">
            <div className="w-full">
              <h2 className="text-lg font-medium text-gray-700 mb-3">Display Configuration</h2>
              <DataDisplaySettings 
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                onApplySettings={handleApplySettings}
                isLoading={isLoading}
              />
            </div>

            <div className="w-full">
              <h2 className="text-lg font-medium text-gray-700 mb-3">Data Export</h2>
              <ExportData 
                dataType={dataType}
                setDataType={setDataType}
                dateRange={dateRange}
                setDateRange={setDateRange}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                exportType={exportType}
                setExportType={setExportType}
                handleExport={handleExport}
                isLoading={isLoading}
                dataLength={data.length}
                selectedMonthValue={selectedMonthValue}
                setSelectedMonthValue={setSelectedMonthValue}
                selectedYearValue={selectedYearValue}
                setSelectedYearValue={setSelectedYearValue}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
