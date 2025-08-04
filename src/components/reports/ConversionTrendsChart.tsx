import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversionDataItem {
  year: number;
  month: string;
  totalInterviews: number;
  statusCounts: {
    [key: string]: number;
  };
  candidates: any[];
}

interface ConversionTrendsChartProps {
  data: ConversionDataItem[];
  onExportExcel: (isPercentage?: boolean) => void;
}

const ConversionTrendsChart: React.FC<ConversionTrendsChartProps> = ({ data, onExportExcel }) => {
  // Transform data for line chart
  const chartData = data.map(item => ({
    month: item.month,
    'Attended': item.statusCounts['Attended'] || 0,
    'Selected / Offered': item.statusCounts['Selected / Offered'] || 0,
    'Rejected': item.statusCounts['Rejected'] || 0,
    'SL -2nd Round+': item.statusCounts['SL -2nd Round+'] || 0,
    'Feedback Awaited': item.statusCounts['Feedback Awaited'] || 0,
    'Others': item.statusCounts['Others'] || 0,
    'Total Interviews': item.totalInterviews
  }));

  const colors = {
    'Attended': '#3b82f6',
    'Selected / Offered': '#10b981',
    'Rejected': '#ef4444',
    'SL -2nd Round+': '#f59e0b',
    'Feedback Awaited': '#8b5cf6',
    'Others': '#6b7280'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conversion Trends</CardTitle>
            <CardDescription>
              Monthly trends showing interview outcomes over time
            </CardDescription>
          </div>
          <Button onClick={() => onExportExcel(false)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              {Object.entries(colors).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionTrendsChart;