
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AttendedCasesData {
  month: string;
  Attended: number;
  Rejected: number;
  'SL-2ndRound+': number;
  'Selected/Offered': number;
  'FeedbackAwaited': number;
  Others: number;
}

interface AttendedCasesChartProps {
  data: AttendedCasesData[];
  isPercentage?: boolean;
  onExportExcel: () => void;
  title: string;
  description: string;
}

const chartConfig = {
  Attended: {
    label: "Attended",
    color: "#10B981",
  },
  Rejected: {
    label: "Rejected", 
    color: "#EF4444",
  },
  "SL-2ndRound+": {
    label: "SL-2nd Round+",
    color: "#F59E0B",
  },
  "Selected/Offered": {
    label: "Selected/Offered",
    color: "#8B5CF6",
  },
  FeedbackAwaited: {
    label: "Feedback Awaited",
    color: "#06B6D4",
  },
  Others: {
    label: "Others",
    color: "#6B7280",
  },
};

const AttendedCasesChart: React.FC<AttendedCasesChartProps> = ({ 
  data, 
  isPercentage = false, 
  onExportExcel,
  title,
  description 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button onClick={onExportExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
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
                  value: isPercentage ? 'Percentage (%)' : 'Count', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar 
                dataKey="Attended" 
                stackId="a"
                fill="#10B981"
                name="Attended"
              />
              <Bar 
                dataKey="Rejected" 
                stackId="a"
                fill="#EF4444"
                name="Rejected"
              />
              <Bar 
                dataKey="SL-2ndRound+" 
                stackId="a"
                fill="#F59E0B"
                name="SL-2nd Round+"
              />
              <Bar 
                dataKey="Selected/Offered" 
                stackId="a"
                fill="#8B5CF6"
                name="Selected/Offered"
              />
              <Bar 
                dataKey="FeedbackAwaited" 
                stackId="a"
                fill="#06B6D4"
                name="Feedback Awaited"
              />
              <Bar 
                dataKey="Others" 
                stackId="a"
                fill="#6B7280"
                name="Others"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AttendedCasesChart;
