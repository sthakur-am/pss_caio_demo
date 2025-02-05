import React, { useRef, useEffect } from 'react';
import { TranscriptionSegment } from '../types';

interface TranscriptionDisplayProps {
  segments: TranscriptionSegment[];
  recentText: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  segments,
  recentText
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Recent Text</h3>
        <div className="bg-gray-50 p-3 rounded-md min-h-[60px]">
          {recentText || 'Waiting for speech...'}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="bg-white rounded-lg shadow-lg p-4 h-[400px] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold mb-2">Full Transcript</h3>
        {segments.map((segment, index) => (
          <div key={index} className="mb-4">
            <div className="text-sm text-gray-500 mb-1">
              {segment.timestamp}
              {segment.speaker && ` - ${segment.speaker}`}
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              {segment.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};