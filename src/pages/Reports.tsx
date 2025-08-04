
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingActionReport from '@/components/reports/PendingActionReport';
import InterviewConversionReport from '@/components/reports/InterviewConversionReport';

const Reports: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analytics and insights for your recruitment process</p>
        </div>

        <Tabs defaultValue="pending-action" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending-action">Pending Action Report</TabsTrigger>
            <TabsTrigger value="conversion">Interview Conversion Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending-action" className="space-y-6">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Actions Distribution</h2>
                <p className="text-gray-600">
                  Visual breakdown of pending actions by time period and status category
                </p>
              </div>
              
              <PendingActionReport />
            </div>
          </TabsContent>
          
          <TabsContent value="conversion" className="space-y-4">
            <InterviewConversionReport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
