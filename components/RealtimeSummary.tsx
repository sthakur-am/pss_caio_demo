import React from 'react';
import { RealtimeSummary } from '../types';
import { FileText, Calendar, CheckSquare } from 'lucide-react';

interface RealtimeSummaryProps {
  summary: RealtimeSummary;
}

export const RealtimeSummaryDisplay: React.FC<RealtimeSummaryProps> = ({
  summary
}) => {
  return (
    <div className="fixed top-4 right-4 w-80 bg-gray-900/90 backdrop-blur rounded-lg shadow-xl p-4 text-white">
      <div className="text-sm text-gray-400 mb-2">
        Last updated: {summary.timestamp}
      </div>
      
      {summary.keyPoints.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <FileText className="w-4 h-4" />
            <h3 className="font-medium">Key Points</h3>
          </div>
          <ul className="space-y-1 text-sm">
            {summary.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {summary.actionItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckSquare className="w-4 h-4" />
            <h3 className="font-medium">Action Items</h3>
          </div>
          <ul className="space-y-1 text-sm">
            {summary.actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {summary.deadlines.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Deadlines</h3>
          </div>
          <ul className="space-y-1 text-sm">
            {summary.deadlines.map((deadline, index) => (
              <li key={index}>{deadline}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};