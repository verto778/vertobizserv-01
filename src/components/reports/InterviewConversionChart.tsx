import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface StatusOverviewData {
  month: string;
  'Attended': number;
  'Rejected': number;
  'SL -2nd Round+': number;
  'Offered': number;
}

interface InterviewConversionChartProps {
  data: StatusOverviewData[];
  onExportExcel: () => void;
}

const InterviewConversionChart: React.FC<InterviewConversionChartProps> = ({ 
  data,
  onExportExcel 
}) => {
  // Define colors for each status category
  const statusColors = {
    'Attended': '#10B981', // Green
    'Rejected': '#EF4444', // Red
    'SL -2nd Round+': '#F59E0B', // Amber
    'Offered': '#8B5CF6' // Purple
  };

  const chartConfig = {
    'Attended': { label: "Attended", color: statusColors['Attended'] },
    'Rejected': { label: "Rejected", color: statusColors['Rejected'] },
    'SL -2nd Round+': { label: "SL -2nd Round+", color: statusColors['SL -2nd Round+'] },
    'Offered': { label: "Offered", color: statusColors['Offered'] }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attended Cases – Overview</CardTitle>
          <CardDescription>No data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No interview data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attended Cases – Overview</CardTitle>
            <CardDescription>
              Interview outcome distribution across selected time period
            </CardDescription>
          </div>
          <Button onClick={onExportExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Count', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Attended" stackId="a" fill={statusColors['Attended']} name="Attended" />
              <Bar dataKey="Rejected" stackId="a" fill={statusColors['Rejected']} name="Rejected" />
              <Bar dataKey="SL -2nd Round+" stackId="a" fill={statusColors['SL -2nd Round+']} name="SL -2nd Round+" />
              <Bar dataKey="Offered" stackId="a" fill={statusColors['Offered']} name="Offered" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewConversionChart;