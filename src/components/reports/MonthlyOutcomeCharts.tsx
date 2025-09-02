
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MonthlyOutcomeChartsProps {
  data: {
    year: number;
    month: string;
    totalInterviews: number;
    statusCounts: { [key: string]: number };
  }[];
  statusCategories: string[];
  onExportExcel: (isPercentage?: boolean) => void;
}

const MonthlyOutcomeCharts: React.FC<MonthlyOutcomeChartsProps> = ({ 
  data, 
  statusCategories, 
  onExportExcel 
}) => {
  // Define colors for each status
  const statusColors = {
    'Attended': '#10B981', // Green
    'Rejected': '#EF4444', // Red
    'SL -2nd Round+': '#F59E0B', // Amber
    'Selected / Offered': '#8B5CF6', // Purple
    'Feedback Awaited': '#3B82F6', // Blue
    'Others': '#6B7280' // Gray
  };

  // Create chart data for each status
  const createChartData = (statusKey: string) => {
    return data.map(monthData => ({
      month: monthData.month,
      count: monthData.statusCounts[statusKey] || 0,
      percentage: monthData.totalInterviews > 0 
        ? ((monthData.statusCounts[statusKey] || 0) / monthData.totalInterviews * 100).toFixed(1)
        : '0.0'
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Count: {data.count}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Interview Outcomes</CardTitle>
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
    <div className="space-y-6">
      {/* Header with Export Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Interview Outcomes - Graphical View</CardTitle>
              <CardDescription>
                Month-wise breakdown of each interview outcome category with visual charts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onExportExcel(false)} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Counts
              </Button>
              <Button onClick={() => onExportExcel(true)} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Percentages
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Individual Charts for Each Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusCategories.map((statusKey) => {
          const chartData = createChartData(statusKey);
          const color = statusColors[statusKey as keyof typeof statusColors];
          const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

          return (
            <Card key={statusKey} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    {statusKey}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color }}>
                      {totalCount}
                    </div>
                    <div className="text-sm text-gray-500">Total Cases</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
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
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        fill={color}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Summary Statistics */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {Math.max(...chartData.map(d => d.count))}
                      </div>
                      <div className="text-gray-500">Peak Month</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {(totalCount / chartData.length).toFixed(1)}
                      </div>
                      <div className="text-gray-500">Avg/Month</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {chartData.length > 0 ? 
                          (chartData.reduce((sum, item) => sum + parseFloat(item.percentage), 0) / chartData.length).toFixed(1)
                          : '0.0'
                        }%
                      </div>
                      <div className="text-gray-500">Avg %</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Download Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium text-blue-900 mb-2">Complete Data Available for Download</h3>
            <p className="text-sm text-blue-700">
              Use the export buttons above to download comprehensive Excel reports with detailed month-wise data for all interview outcomes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyOutcomeCharts;
