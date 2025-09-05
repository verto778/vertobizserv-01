
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isValid, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface FilteredDataOptions {
  dataType: 'candidates' | 'clients';
  dateRange: {
    from?: Date;
    to?: Date;
  };
  timePeriod: string; // '30', '90', '180', '180-entire'
  selectedMonth?: Date;
  exportType?: 'range' | 'month';
  selectedMonthValue?: number; // 1-12 for months
  selectedYearValue?: number; // year number
}

export const useFilteredData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async (options: FilteredDataOptions) => {
    setIsLoading(true);
    try {
      console.log('Fetching data with options:', options);
      
      // Initialize the query builder
      let query = supabase.from(options.dataType);
      
      // Build the filter condition
      let filterQuery = query.select('*');
      
      // Handle month/year-based filtering for exports
      if (options.exportType === 'month' && options.selectedYearValue) {
        let startDate: Date;
        let endDate: Date;
        
        if (options.selectedMonthValue) {
          // Specific month and year
          startDate = new Date(options.selectedYearValue, options.selectedMonthValue - 1, 1);
          endDate = endOfMonth(startDate);
          console.log(`Filtering for specific month: ${startDate} to ${endDate}`);
        } else {
          // Entire year
          startDate = startOfYear(new Date(options.selectedYearValue, 0, 1));
          endDate = endOfYear(new Date(options.selectedYearValue, 0, 1));
          console.log(`Filtering for entire year: ${startDate} to ${endDate}`);
        }
        
        filterQuery = filterQuery
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }
      // Apply date filters if provided for range exports
      else if (options.exportType === 'range' && options.dateRange.from && options.dateRange.to && 
          isValid(options.dateRange.from) && isValid(options.dateRange.to)) {
        const fromDate = format(options.dateRange.from, 'yyyy-MM-dd');
        const toDate = format(options.dateRange.to, 'yyyy-MM-dd');
        
        console.log(`Filtering for date range: ${fromDate} to ${toDate}`);
        
        filterQuery = filterQuery
          .gte('created_at', `${fromDate}T00:00:00`)
          .lte('created_at', `${toDate}T23:59:59`);
      } 
      // If no date range but time period is specified (for dashboard)
      else if (options.timePeriod && !options.exportType) {
        const today = new Date();
        const daysAgo = parseInt(options.timePeriod.replace('-entire', ''));
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - daysAgo);
        
        console.log(`Filtering for time period: ${daysAgo} days ago from ${pastDate}`);
        
        filterQuery = filterQuery.gte('created_at', pastDate.toISOString());
      }

      // Execute the query
      const { data: fetchedData, error } = await filterQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log(`Fetched ${fetchedData?.length || 0} records`);
      
      setData(fetchedData || []);
      return fetchedData || [];
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: error.message || "Failed to load data",
        variant: "destructive"
      });
      setData([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = (exportData: any[], fileName: string = 'export') => {
    try {
      console.log(`Exporting ${exportData.length} records to Excel`);
      
      if (!exportData || exportData.length === 0) {
        console.warn('No data to export');
        toast({
          title: "No data to export",
          description: "The selected period contains no data.",
          variant: "destructive"
        });
        return;
      }
      
      const INDIA_TIMEZONE = 'Asia/Kolkata';
      
      // Format dates in the data for better readability with India timezone
      const formattedData = exportData.map(item => {
        const newItem = { ...item };
        
        // Format created_at date if exists (Info Date)
        if (newItem.created_at && typeof newItem.created_at === 'string') {
          try {
            const date = parseISO(newItem.created_at);
            if (isValid(date)) {
              newItem.created_at = formatInTimeZone(date, INDIA_TIMEZONE, 'MMM dd, yyyy HH:mm');
            }
          } catch (e) {
            // Keep original if parsing fails
          }
        }
        
        // Format date_informed if exists (candidates)
        if (newItem.date_informed && typeof newItem.date_informed === 'string') {
          try {
            const date = parseISO(newItem.date_informed);
            if (isValid(date)) {
              newItem.date_informed = formatInTimeZone(date, INDIA_TIMEZONE, 'MMM dd, yyyy');
            }
          } catch (e) {
            // Keep original if parsing fails
          }
        }
        
        // Format interview_date if exists (candidates)
        if (newItem.interview_date && typeof newItem.interview_date === 'string') {
          try {
            const date = parseISO(newItem.interview_date);
            if (isValid(date)) {
              newItem.interview_date = formatInTimeZone(date, INDIA_TIMEZONE, 'MMM dd, yyyy');
            }
          } catch (e) {
            // Keep original if parsing fails
          }
        }
        
        return newItem;
      });
      
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Save file
      const fileNameWithDate = `${fileName}.xlsx`;
      saveAs(data, fileNameWithDate);
      
      toast({
        title: "Export successful",
        description: `${exportData.length} records exported to ${fileNameWithDate}`,
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    data,
    fetchData,
    exportToExcel
  };
};
