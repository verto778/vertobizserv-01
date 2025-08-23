
import React, { useRef, useEffect } from 'react';
import { Users, ThumbsDown, Clock, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTimePeriod } from '@/hooks/useTimePeriod';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className }) => {
  return (
    <Card className={`border dashboard-card ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-br from-blue-800 to-blue-600 bg-clip-text text-transparent">{value}</div>
          {icon && <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsSection: React.FC = () => {
  const { timePeriod } = useTimePeriod();
  const { statistics, isLoading: statsLoading } = useDashboardStats(timePeriod);
  const statsRef = useRef(null);

  useEffect(() => {
    if (statsRef.current) {
      statsRef.current.classList.add('animate-fade-in');
    }
  }, []);

  return (
    <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-0">
      {statsLoading ? (
        <div className="col-span-4 flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          <StatCard 
            title="Total Candidates" 
            value={statistics.totalCandidates} 
            icon={<Users className="h-5 w-5 text-blue-600" />}
            className="border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-md"
          />
          <StatCard 
            title="Not Interested" 
            value={statistics.notInterested} 
            icon={<ThumbsDown className="h-5 w-5 text-red-600" />}
            className="border-red-100 bg-gradient-to-br from-white to-red-50 shadow-md"
          />
          <StatCard 
            title="Interview Pending" 
            value={statistics.interviewPending} 
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            className="border-amber-100 bg-gradient-to-br from-white to-amber-50 shadow-md"
          />
          <StatCard 
            title="Feedback Awaited" 
            value={statistics.feedbackAwaited}  
            icon={<HelpCircle className="h-5 w-5 text-purple-600" />}
            className="border-purple-100 bg-gradient-to-br from-white to-purple-50 shadow-md"
          />
        </>
      )}
    </div>
  );
};

export default StatsSection;
