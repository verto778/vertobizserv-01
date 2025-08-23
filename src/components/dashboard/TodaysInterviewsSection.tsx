
import React, { useRef, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTodaysInterviews } from '@/hooks/useTodaysInterviews';

const TodaysInterviewsSection: React.FC = () => {
  const { interviews: todaysInterviews, isLoading: interviewsLoading } = useTodaysInterviews();
  const todaysInterviewsRef = useRef(null);

  useEffect(() => {
    if (todaysInterviewsRef.current) {
      todaysInterviewsRef.current.classList.add('animate-fade-in');
    }
  }, []);

  return (
    <div ref={todaysInterviewsRef} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 opacity-0">
      <h2 className="text-lg font-medium mb-6 text-[#0a1a35] flex items-center">
        <CalendarClock className="h-5 w-5 mr-2 text-blue-600" />
        Today's Interviews
      </h2>
      <div className="overflow-x-auto">
        {interviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Recruiter</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status 1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysInterviews.length > 0 ? (
                todaysInterviews.map((interview, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{interview.candidate}</TableCell>
                    <TableCell>{interview.mobile}</TableCell>
                    <TableCell>{interview.client}</TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{interview.recruiter}</TableCell>
                    <TableCell>{interview.manager}</TableCell>
                    <TableCell>{interview.time}</TableCell>
                    <TableCell>{interview.mode}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        interview.status1 === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        interview.status1 === 'Yet to Confirm' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interview.status1}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-4">
                    No interviews scheduled for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TodaysInterviewsSection;
