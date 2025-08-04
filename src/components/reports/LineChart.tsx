import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface LineChartProps {
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

const StatusLineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Line 
            type="monotone" 
            dataKey="Below_7_days" 
            stroke="#FF8C00"
            strokeWidth={2}
            dot={{ r: 4, fill: "#FF8C00" }}
            name="Below 7 days"
          />
          <Line 
            type="monotone" 
            dataKey="8_15_days" 
            stroke="#FF4444"
            strokeWidth={2}
            dot={{ r: 4, fill: "#FF4444" }}
            name="8-15 days"
          />
          <Line 
            type="monotone" 
            dataKey="16_30_days" 
            stroke="#4488FF"
            strokeWidth={2}
            dot={{ r: 4, fill: "#4488FF" }}
            name="16-30 days"
          />
          <Line 
            type="monotone" 
            dataKey="31_60_days" 
            stroke="#AA44FF"
            strokeWidth={2}
            dot={{ r: 4, fill: "#AA44FF" }}
            name="31-60 days"
          />
          <Line 
            type="monotone" 
            dataKey="Above_60_days" 
            stroke="#8844FF"
            strokeWidth={2}
            dot={{ r: 4, fill: "#8844FF" }}
            name="Above 60 days"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StatusLineChart;