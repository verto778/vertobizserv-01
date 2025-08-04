
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

interface InterviewConversionChartProps {
  data: {
    year: number;
    month: string;
    totalInterviews: number;
    statusCounts: { [key: string]: number };
  }[];
  isPercentage?: boolean;
}

const InterviewConversionChart: React.FC<InterviewConversionChartProps> = ({ 
  data, 
  isPercentage = false 
}) => {
  // Define colors for each status category
  const statusColors = {
    'Attended': '#10B981', // Green
    'Rejected': '#EF4444', // Red
    'SL -2nd Round+': '#F59E0B', // Amber
    'Selected / Offered': '#8B5CF6', // Purple
    'Feedback Awaited': '#3B82F6', // Blue
    'Others': '#6B7280' // Gray
  };

  // Aggregate data across all months for the chart
  const aggregatedData = React.useMemo(() => {
    const totals: { [key: string]: number } = {};
    let grandTotal = 0;

    // Sum up all status counts across months
    data.forEach(monthData => {
      Object.keys(monthData.statusCounts).forEach(status => {
        totals[status] = (totals[status] || 0) + monthData.statusCounts[status];
        grandTotal += monthData.statusCounts[status];
      });
    });

    // Convert to chart data format
    return Object.keys(totals)
      .filter(status => totals[status] > 0) // Only include non-zero values
      .map(status => ({
        name: status,
        value: totals[status],
        percentage: grandTotal > 0 ? ((totals[status] / grandTotal) * 100).toFixed(1) : '0.0',
        color: statusColors[status as keyof typeof statusColors] || '#6B7280'
      }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: {data.value}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (aggregatedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Status Distribution</CardTitle>
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
        <CardTitle>Interview Status Distribution</CardTitle>
        <CardDescription>
          Overall distribution of interview outcomes across selected time period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {aggregatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {aggregatedData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{item.value}</div>
                <div className="text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewConversionChart;
