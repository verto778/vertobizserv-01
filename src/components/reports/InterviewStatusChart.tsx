
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface InterviewStatusChartProps {
  data: any[];
}

const chartConfig = {
  "Below_7_days": {
    label: "Below 7 days",
    color: "#FF8C00",
  },
  "8_15_days": {
    label: "8-15 days", 
    color: "#FF4444",
  },
  "16_30_days": {
    label: "16-30 days",
    color: "#4488FF",
  },
  "31_60_days": {
    label: "31-60 days",
    color: "#AA44FF",
  },
  "Above_60_days": {
    label: "Above 60 days",
    color: "#8844FF",
  },
};

const InterviewStatusChart: React.FC<InterviewStatusChartProps> = ({ data }) => {
  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar 
            dataKey="Below_7_days" 
            fill="#FF8C00"
            name="Below 7 days"
          />
          <Bar 
            dataKey="8_15_days" 
            fill="#FF4444"
            name="8-15 days"
          />
          <Bar 
            dataKey="16_30_days" 
            fill="#4488FF"
            name="16-30 days"
          />
          <Bar 
            dataKey="31_60_days" 
            fill="#AA44FF"
            name="31-60 days"
          />
          <Bar 
            dataKey="Above_60_days" 
            fill="#8844FF"
            name="Above 60 days"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default InterviewStatusChart;
