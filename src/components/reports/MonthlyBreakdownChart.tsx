import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConversionDataItem {
  year: number;
  month: string;
  totalInterviews: number;
  statusCounts: {
    [key: string]: number;
  };
  candidates: any[];
}

interface MonthlyBreakdownChartProps {
  data: ConversionDataItem[];
  onExportExcel: (isPercentage?: boolean) => void;
}

const MonthlyBreakdownChart: React.FC<MonthlyBreakdownChartProps> = ({ data, onExportExcel }) => {
  const [showPercentages, setShowPercentages] = useState(false);

  // Transform data for grouped bar chart
  const chartData = data.map(item => {
    const counts = {
      month: item.month,
      'Attended': item.statusCounts['Attended'] || 0,
      'Selected / Offered': item.statusCounts['Selected / Offered'] || 0,
      'Rejected': item.statusCounts['Rejected'] || 0,
      'SL -2nd Round+': item.statusCounts['SL -2nd Round+'] || 0,
      'Feedback Awaited': item.statusCounts['Feedback Awaited'] || 0,
      'Others': item.statusCounts['Others'] || 0,
      total: item.totalInterviews
    };

    if (showPercentages && item.totalInterviews > 0) {
      return {
        month: item.month,
        'Attended': ((counts['Attended'] / item.totalInterviews) * 100),
        'Selected / Offered': ((counts['Selected / Offered'] / item.totalInterviews) * 100),
        'Rejected': ((counts['Rejected'] / item.totalInterviews) * 100),
        'SL -2nd Round+': ((counts['SL -2nd Round+'] / item.totalInterviews) * 100),
        'Feedback Awaited': ((counts['Feedback Awaited'] / item.totalInterviews) * 100),
        'Others': ((counts['Others'] / item.totalInterviews) * 100),
        total: 100
      };
    }

    return counts;
  });

  const colors = {
    'Attended': '#3b82f6',
    'Selected / Offered': '#10b981',
    'Rejected': '#ef4444',
    'SL -2nd Round+': '#f59e0b',
    'Feedback Awaited': '#8b5cf6',
    'Others': '#6b7280'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${showPercentages ? entry.value.toFixed(1) + '%' : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              {showPercentages 
                ? 'Percentage distribution of interview outcomes by month'
                : 'Absolute numbers of interview outcomes by month'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {showPercentages ? 'Percentages' : 'Counts'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPercentages(!showPercentages)}
                className="flex items-center gap-2"
              >
                {showPercentages ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                Toggle View
              </Button>
            </div>
            <Button onClick={() => onExportExcel(showPercentages)} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: showPercentages ? 'Percentage (%)' : 'Count', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(colors).map(([key, color]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyBreakdownChart;