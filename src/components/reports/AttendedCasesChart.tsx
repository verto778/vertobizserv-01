
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface AttendedCasesData {
  month: string;
  Attended: number;
  'Client Conf Pending': number;
  Confirmed: number;
  'Not Attended': number;
  'Not Interested': number;
  'Position Hold': number;
  Reschedule: number;
  'Yet to Confirm': number;
}

interface AttendedCasesChartProps {
  data: AttendedCasesData[];
  isPercentage?: boolean;
  onExportExcel: () => void;
  onExportPercentageExcel?: () => void;
  title: string;
  description: string;
}

const chartConfig = {
  Attended: {
    label: "Attended",
    color: "#10B981",
  },
  "Client Conf Pending": {
    label: "Client Conf Pending", 
    color: "#EF4444",
  },
  Confirmed: {
    label: "Confirmed",
    color: "#F59E0B",
  },
  "Not Attended": {
    label: "Not Attended",
    color: "#8B5CF6",
  },
  "Not Interested": {
    label: "Not Interested",
    color: "#06B6D4",
  },
  "Position Hold": {
    label: "Position Hold",
    color: "#6B7280",
  },
  Reschedule: {
    label: "Reschedule",
    color: "#FB7185",
  },
  "Yet to Confirm": {
    label: "Yet to Confirm",
    color: "#FBBF24",
  },
};

const AttendedCasesChart: React.FC<AttendedCasesChartProps> = ({ 
  data, 
  isPercentage = false, 
  onExportExcel,
  onExportPercentageExcel,
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
          <div className="flex gap-2">
            <Button onClick={onExportExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Excel (Count)
            </Button>
            {onExportPercentageExcel && (
              <Button onClick={onExportPercentageExcel} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Excel (%)
              </Button>
            )}
          </div>
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
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, entry) => sum + (entry.value as number), 0);
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((entry, index) => {
                          const percentage = total > 0 ? ((entry.value as number) / total * 100).toFixed(1) : '0.0';
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-3 h-3 rounded" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}:</span>
                              <span className="font-medium">
                                {isPercentage ? `${entry.value}%` : `${entry.value} (${percentage}%)`}
                              </span>
                            </div>
                          );
                        })}
                        {!isPercentage && (
                          <div className="mt-2 pt-2 border-t text-sm font-medium">
                            Total: {total}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar 
                dataKey="Attended" 
                stackId="a"
                fill="#10B981"
                name="Attended"
              />
              <Bar 
                dataKey="Client Conf Pending" 
                stackId="a"
                fill="#EF4444"
                name="Client Conf Pending"
              />
              <Bar 
                dataKey="Confirmed" 
                stackId="a"
                fill="#F59E0B"
                name="Confirmed"
              />
              <Bar 
                dataKey="Not Attended" 
                stackId="a"
                fill="#8B5CF6"
                name="Not Attended"
              />
              <Bar 
                dataKey="Not Interested" 
                stackId="a"
                fill="#06B6D4"
                name="Not Interested"
              />
              <Bar 
                dataKey="Position Hold" 
                stackId="a"
                fill="#6B7280"
                name="Position Hold"
              />
              <Bar 
                dataKey="Reschedule" 
                stackId="a"
                fill="#FB7185"
                name="Reschedule"
              />
              <Bar 
                dataKey="Yet to Confirm" 
                stackId="a"
                fill="#FBBF24"
                name="Yet to Confirm"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AttendedCasesChart;
