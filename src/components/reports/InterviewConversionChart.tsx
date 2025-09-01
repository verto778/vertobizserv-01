
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface StatusOverviewData {
  month: string;
  Documentation: number;
  Drop: number;
  'Feedback Awaited': number;
  'Final Reject': number;
  Hold: number;
  'Interview Reject': number;
  Joined: number;
  Offered: number;
  'Offered Drop': number;
  Selected: number;
  Shortlisted: number;
  'SL-2+': number;
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
    'Documentation': '#10B981', // Green
    'Drop': '#EF4444', // Red
    'Feedback Awaited': '#F59E0B', // Amber
    'Final Reject': '#8B5CF6', // Purple
    'Hold': '#3B82F6', // Blue
    'Interview Reject': '#6B7280', // Gray
    'Joined': '#EC4899', // Pink
    'Offered': '#84CC16', // Lime
    'Offered Drop': '#F97316', // Orange
    'Selected': '#06B6D4', // Cyan
    'Shortlisted': '#8B5CF6', // Violet
    'SL-2+': '#FBBF24', // Yellow
  };

  const chartConfig = {
    Documentation: { label: "Documentation", color: statusColors.Documentation },
    Drop: { label: "Drop", color: statusColors.Drop },
    "Feedback Awaited": { label: "Feedback Awaited", color: statusColors["Feedback Awaited"] },
    "Final Reject": { label: "Final Reject", color: statusColors["Final Reject"] },
    Hold: { label: "Hold", color: statusColors.Hold },
    "Interview Reject": { label: "Interview Reject", color: statusColors["Interview Reject"] },
    Joined: { label: "Joined", color: statusColors.Joined },
    Offered: { label: "Offered", color: statusColors.Offered },
    "Offered Drop": { label: "Offered Drop", color: statusColors["Offered Drop"] },
    Selected: { label: "Selected", color: statusColors.Selected },
    Shortlisted: { label: "Shortlisted", color: statusColors.Shortlisted },
    "SL-2+": { label: "SL-2+", color: statusColors["SL-2+"] },
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
            No status2 data to display
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
              Status2 distribution of candidates across selected time period
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
              <Bar dataKey="Documentation" stackId="a" fill={statusColors.Documentation} name="Documentation" />
              <Bar dataKey="Drop" stackId="a" fill={statusColors.Drop} name="Drop" />
              <Bar dataKey="Feedback Awaited" stackId="a" fill={statusColors["Feedback Awaited"]} name="Feedback Awaited" />
              <Bar dataKey="Final Reject" stackId="a" fill={statusColors["Final Reject"]} name="Final Reject" />
              <Bar dataKey="Hold" stackId="a" fill={statusColors.Hold} name="Hold" />
              <Bar dataKey="Interview Reject" stackId="a" fill={statusColors["Interview Reject"]} name="Interview Reject" />
              <Bar dataKey="Joined" stackId="a" fill={statusColors.Joined} name="Joined" />
              <Bar dataKey="Offered" stackId="a" fill={statusColors.Offered} name="Offered" />
              <Bar dataKey="Offered Drop" stackId="a" fill={statusColors["Offered Drop"]} name="Offered Drop" />
              <Bar dataKey="Selected" stackId="a" fill={statusColors.Selected} name="Selected" />
              <Bar dataKey="Shortlisted" stackId="a" fill={statusColors.Shortlisted} name="Shortlisted" />
              <Bar dataKey="SL-2+" stackId="a" fill={statusColors["SL-2+"]} name="SL-2+" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewConversionChart;
