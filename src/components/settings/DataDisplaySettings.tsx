
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3, Save } from 'lucide-react';

interface DataDisplaySettingsProps {
  timePeriod: string;
  setTimePeriod: (value: string) => void;
  onApplySettings: () => void;
  isLoading: boolean;
}

const DataDisplaySettings = ({
  timePeriod,
  setTimePeriod,
  onApplySettings,
  isLoading
}: DataDisplaySettingsProps) => {
  return (
    <Card className="shadow-lg border-0 overflow-hidden bg-white w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Data Display</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label htmlFor="time-period" className="text-base font-medium text-gray-700">Time Period</Label>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full border-gray-300 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Up to 6 months</SelectItem>
              <SelectItem value="180-entire">6 Months – Entire Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white" 
          onClick={onApplySettings}
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          Apply Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataDisplaySettings;
