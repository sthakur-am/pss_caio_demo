import React, { useRef, useEffect } from 'react';
import { TranscriptionSegment } from '../types';

interface ScrollingTranscriptProps {
  segments: TranscriptionSegment[];
  recentText: string;
  textColor?: string;
  fontSize?: string;
  maxLines?: number;
}

export const ScrollingTranscript: React.FC<ScrollingTranscriptProps> = ({
  segments,
  recentText,
  textColor = '#FFFFFF',
  fontSize = '40px',
  maxLines = 1
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<number>();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [segments, recentText]);

  useEffect(() => {
    refreshIntervalRef.current = window.setInterval(() => {
      if (scrollRef.current) {
        const currentDisplay = scrollRef.current.style.display;
        scrollRef.current.style.display = 'none';
        window.requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.style.display = currentDisplay;
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
          }
        });
      }
    }, 5000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const getDisplayText = () => {
    let text = '';
    
    if (segments.length > 0) {
      // Get the last segment's text
      const lastSegment = segments[segments.length - 1];
      text = lastSegment.text;
    }
    
    // Add recent text if available
    if (recentText) {
      text = recentText;
    }

    // Split into lines and take only the specified number of lines
    const lines = text
      .split(/[\n\r]+/)
      .filter(line => line.trim())
      .slice(-maxLines);

    return lines.join('\n') || null;
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div 
        ref={scrollRef}
        className="w-full overflow-hidden"
        style={{
          maxWidth: '1200px',
          height: '80px' // Fixed height for single line
        }}
      >
        <div 
          className="text-center font-medium leading-tight whitespace-nowrap"
          style={{ 
            color: textColor,
            fontSize: fontSize
          }}
        >
          {getDisplayText() || (
            <div className="flex items-center justify-center gap-2">
              Waiting
              <span className="animate-ellipsis-1">.</span>
              <span className="animate-ellipsis-2">.</span>
              <span className="animate-ellipsis-3">.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};