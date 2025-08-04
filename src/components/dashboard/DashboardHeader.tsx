
import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimePeriod } from '@/hooks/useTimePeriod';

const DashboardHeader: React.FC = () => {
  const { timePeriod, setTimePeriod } = useTimePeriod();

  const getTimePeriodLabel = (value: string) => {
    switch (value) {
      case '30':
        return 'Last 30 days';
      case '90':
        return 'Last 90 days';
      case '180':
        return 'Up to 6 months';
      case '180-entire':
        return '6 Months – Entire Date';
      default:
        return 'Last 30 days';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0a1a35] mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your recruitment.</p>
      </div>
      
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[200px] bg-white border-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <SelectValue>{getTimePeriodLabel(timePeriod)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg">
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Up to 6 months</SelectItem>
            <SelectItem value="180-entire">6 Months – Entire Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DashboardHeader;
