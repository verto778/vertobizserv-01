import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AttendedCasesData {
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

interface AttendedCasesChartProps {
  data: AttendedCasesData[];
  isPercentage?: boolean;
  onExportExcel: () => void;
  title: string;
  description: string;
}

const chartConfig = {
  Documentation: {
    label: "Documentation",
    color: "#10B981",
  },
  Drop: {
    label: "Drop", 
    color: "#EF4444",
  },
  "Feedback Awaited": {
    label: "Feedback Awaited",
    color: "#F59E0B",
  },
  "Final Reject": {
    label: "Final Reject",
    color: "#8B5CF6",
  },
  Hold: {
    label: "Hold",
    color: "#06B6D4",
  },
  "Interview Reject": {
    label: "Interview Reject",
    color: "#6B7280",
  },
  Joined: {
    label: "Joined",
    color: "#FB7185",
  },
  Offered: {
    label: "Offered",
    color: "#84CC16",
  },
  "Offered Drop": {
    label: "Offered Drop",
    color: "#F97316",
  },
  Selected: {
    label: "Selected",
    color: "#06B6D4",
  },
  Shortlisted: {
    label: "Shortlisted",
    color: "#8B5CF6",
  },
  "SL-2+": {
    label: "SL-2+",
    color: "#FBBF24",
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
                dataKey="Documentation" 
                stackId="a"
                fill="#10B981"
                name="Documentation"
              />
              <Bar 
                dataKey="Drop" 
                stackId="a"
                fill="#EF4444"
                name="Drop"
              />
              <Bar 
                dataKey="Feedback Awaited" 
                stackId="a"
                fill="#F59E0B"
                name="Feedback Awaited"
              />
              <Bar 
                dataKey="Final Reject" 
                stackId="a"
                fill="#8B5CF6"
                name="Final Reject"
              />
              <Bar 
                dataKey="Hold" 
                stackId="a"
                fill="#06B6D4"
                name="Hold"
              />
              <Bar 
                dataKey="Interview Reject" 
                stackId="a"
                fill="#6B7280"
                name="Interview Reject"
              />
              <Bar 
                dataKey="Joined" 
                stackId="a"
                fill="#FB7185"
                name="Joined"
              />
              <Bar 
                dataKey="Offered" 
                stackId="a"
                fill="#84CC16"
                name="Offered"
              />
              <Bar 
                dataKey="Offered Drop" 
                stackId="a"
                fill="#F97316"
                name="Offered Drop"
              />
              <Bar 
                dataKey="Selected" 
                stackId="a"
                fill="#06B6D4"
                name="Selected"
              />
              <Bar 
                dataKey="Shortlisted" 
                stackId="a"
                fill="#8B5CF6"
                name="Shortlisted"
              />
              <Bar 
                dataKey="SL-2+" 
                stackId="a"
                fill="#FBBF24"
                name="SL-2+"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AttendedCasesChart;