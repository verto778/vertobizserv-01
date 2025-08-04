
import React, { useRef, useEffect } from 'react';
import { BriefcaseIcon, UserPlus, Building, Clock, CheckCircle, UserCheck, FileText } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';

const RecentActivitySection: React.FC = () => {
  const { activities: recentActivities, isLoading: activitiesLoading } = useRecentActivity();
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.classList.add('animate-fade-in');
    }
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'candidate':
        return <UserPlus className="h-5 w-5 text-blue-600" />;
      case 'client':
        return <Building className="h-5 w-5 text-green-600" />;
      case 'recruiter':
        return <UserCheck className="h-5 w-5 text-purple-600" />;
      case 'position':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'interview':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'status':
        return <CheckCircle className="h-5 w-5 text-indigo-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'candidate':
        return 'bg-blue-50 text-blue-700';
      case 'client':
        return 'bg-green-50 text-green-700';
      case 'recruiter':
        return 'bg-purple-50 text-purple-700';
      case 'position':
        return 'bg-orange-50 text-orange-700';
      case 'interview':
        return 'bg-amber-50 text-amber-700';
      case 'status':
        return 'bg-indigo-50 text-indigo-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div ref={activityRef} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 opacity-0">
      <h2 className="text-lg font-medium mb-6 text-[#0a1a35] flex items-center">
        <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" />
        Recent Activity
        {activitiesLoading && (
          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </h2>
      
      {activitiesLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div 
                key={`${activity.type}-${activity.time}-${index}`}
                className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timeDisplay}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityBadgeColor(activity.type)}`}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BriefcaseIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent activities found.</p>
              <p className="text-xs text-gray-400 mt-1">Activities will appear here when you add or update candidates, clients, recruiters, or positions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivitySection;
