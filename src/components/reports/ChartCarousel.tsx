
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BarChart3, Grid3X3, TrendingUp } from 'lucide-react';
import StackedBarChart from './StackedBarChart';
import StatusLineChart from './LineChart';
import { cn } from '@/lib/utils';

interface ChartCarouselProps {
  data: any[];
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ data }) => {
  const [currentView, setCurrentView] = useState(0);

  const views = [
    {
      id: 'stacked-bar',
      title: 'Stacked Bar Chart',
      description: 'Status distribution by time periods',
      icon: BarChart3,
      component: <StackedBarChart data={data} />
    },
    {
      id: 'line-trend',
      title: 'Trend Analysis',
      description: 'Time period trends across statuses',
      icon: TrendingUp,
      component: <StatusLineChart data={data} />
    },
    {
      id: 'summary-grid',
      title: 'Summary Grid',
      description: 'Quick overview of all metrics',
      icon: Grid3X3,
      component: <SummaryGrid data={data} />
    }
  ];

  const nextView = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const prevView = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

  const currentViewData = views[currentView];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <currentViewData.icon className="h-5 w-5" />
            <div>
              <CardTitle>{currentViewData.title}</CardTitle>
              <CardDescription>{currentViewData.description}</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {views.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentView(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentView ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={prevView}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextView}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="transition-all duration-300">
          {currentViewData.component}
        </div>
      </CardContent>
    </Card>
  );
};

// Summary Grid Component
const SummaryGrid: React.FC<{ data: any[] }> = ({ data }) => {
  const timePeriods = ['Below_7_days', '8_15_days', '16_30_days', '31_60_days', 'Above_60_days'];
  const periodLabels = {
    'Below_7_days': 'Below 7 days',
    '8_15_days': '8-15 days',
    '16_30_days': '16-30 days', 
    '31_60_days': '31-60 days',
    'Above_60_days': 'Above 60 days'
  };

  // Calculate totals for each time period
  const periodTotals = timePeriods.map(period => {
    const total = data.reduce((sum, item) => sum + (item[period] || 0), 0);
    return {
      period: periodLabels[period],
      count: total,
      color: getColorForPeriod(period)
    };
  });

  // Calculate totals for each status
  const statusTotals = data.map(item => {
    const total = timePeriods.reduce((sum, period) => sum + (item[period] || 0), 0);
    return {
      status: item.status,
      count: total,
      color: getColorForStatus(item.status)
    };
  });

  return (
    <div className="space-y-6">
      {/* Time Period Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">By Time Period</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {periodTotals.map((period) => (
            <Card key={period.period} className="p-4">
              <div className="text-center">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: period.color }}
                />
                <div className="text-2xl font-bold">{period.count}</div>
                <div className="text-sm text-muted-foreground">{period.period}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">By Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statusTotals.map((status) => (
            <Card key={status.status} className="p-4">
              <div className="text-center">
                <Badge 
                  className="mb-2"
                  style={{ backgroundColor: status.color, color: 'white' }}
                >
                  {status.status}
                </Badge>
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm text-muted-foreground">candidates</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions for colors
const getColorForPeriod = (period: string) => {
  const colors = {
    'Below_7_days': '#FF8C00',
    '8_15_days': '#FF4444',
    '16_30_days': '#4488FF',
    '31_60_days': '#AA44FF',
    'Above_60_days': '#8844FF'
  };
  return colors[period] || '#666666';
};

const getColorForStatus = (status: string) => {
  const colors = {
    'Client Confirmation': '#3B82F6',
    'Yet to Confirm': '#EAB308',
    'Not Attended': '#EF4444',
    'Reschedule': '#F97316',
    'Feedback Awaited': '#8B5CF6'
  };
  return colors[status] || '#666666';
};

export default ChartCarousel;
