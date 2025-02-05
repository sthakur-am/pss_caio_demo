import React from 'react';
import { X, Printer } from 'lucide-react';
import { TranscriptionSegment, Summary } from '../types';
import { formatDate } from '../utils/transcription';

interface TranscriptionSummaryProps {
  segments: TranscriptionSegment[];
  summary: Summary | null;
  onClose: () => void;
}

export const TranscriptionSummary: React.FC<TranscriptionSummaryProps> = ({
  segments,
  summary,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold">Discussion Transcript</h1>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Printer className="w-5 h-5" />
              Save as PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
        </div>

        <div className="space-y-8 text-[40px] leading-normal">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="font-bold">{formatDate(new Date())}</h2>
            <p>Start Time: {summary.startTime}</p>
            <p>End Time: {summary.endTime}</p>
            <p>Participants: {summary.participants.map(p => `Speaker ${p}`).join(', ')}</p>
          </header>

          <section className="space-y-8">
            {segments.map((segment, index) => (
              <div key={index} className="space-y-2">
                <div className="text-gray-500 text-[32px]">{segment.timestamp}</div>
                <div className="flex gap-4">
                  <span className="font-bold">Speaker {segment.speaker}:</span>
                  <span>{segment.text}</span>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};