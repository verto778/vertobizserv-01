
import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import StatsSection from './dashboard/StatsSection';
import TodaysInterviewsSection from './dashboard/TodaysInterviewsSection';
import RecentActivitySection from './dashboard/RecentActivitySection';
import { TimePeriodProvider } from '@/hooks/useTimePeriod';

const DashboardContent: React.FC = () => {
  return (
    <TimePeriodProvider>
      <div className="space-y-8 p-8 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <DashboardHeader />
        <StatsSection />
        <TodaysInterviewsSection />
        <RecentActivitySection />
      </div>
    </TimePeriodProvider>
  );
};

export default DashboardContent;
