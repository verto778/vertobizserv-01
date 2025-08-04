
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PendingActionChartProps {
  data: any[];
}

const chartConfig = {
  Client_Confirmation: {
    label: "Client Confirmation",
    color: "hsl(var(--chart-1))",
  },
  Yet_to_confirm: {
    label: "Yet to Confirm",
    color: "hsl(var(--chart-2))",
  },
  Not_Attended: {
    label: "Not Attended",
    color: "hsl(var(--chart-3))",
  },
  Reschedule: {
    label: "Reschedule",
    color: "hsl(var(--chart-4))",
  },
  Feedback_Awaited: {
    label: "Feedback Awaited",
    color: "hsl(var(--chart-5))",
  },
};

const PendingActionChart: React.FC<PendingActionChartProps> = ({ data }) => {
  return (
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
            dataKey="timePeriod" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar 
            dataKey="Client_Confirmation" 
            stackId="a" 
            fill="var(--color-Client_Confirmation)"
            name="Client Confirmation"
          />
          <Bar 
            dataKey="Yet_to_confirm" 
            stackId="a" 
            fill="var(--color-Yet_to_confirm)"
            name="Yet to Confirm"
          />
          <Bar 
            dataKey="Not_Attended" 
            stackId="a" 
            fill="var(--color-Not_Attended)"
            name="Not Attended"
          />
          <Bar 
            dataKey="Reschedule" 
            stackId="a" 
            fill="var(--color-Reschedule)"
            name="Reschedule"
          />
          <Bar 
            dataKey="Feedback_Awaited" 
            stackId="a" 
            fill="var(--color-Feedback_Awaited)"
            name="Feedback Awaited"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PendingActionChart;
