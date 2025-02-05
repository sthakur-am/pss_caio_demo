import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { TranscriptionSegment } from '../types';
import toast from 'react-hot-toast';

interface TranscriptUploadProps {
  onUpload: (segments: TranscriptionSegment[]) => void;
}

export const TranscriptUpload: React.FC<TranscriptUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const segments: TranscriptionSegment[] = [];
      
      // Parse the text file
      const lines = text.split('\n');
      let currentSegment: Partial<TranscriptionSegment> = {};
      
      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Look for speaker pattern regardless of timestamp
        const speakerMatch = line.match(/Speaker ([A-D]):/i);
        
        if (speakerMatch) {
          // If we have a previous segment, save it
          if (currentSegment.speaker && currentSegment.text) {
            segments.push({
              id: crypto.randomUUID(),
              timestamp: new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              speaker: currentSegment.speaker,
              text: currentSegment.text.trim()
            });
          }
          
          // Start new segment, ignoring any timestamp
          currentSegment = {
            speaker: speakerMatch[1] as 'A' | 'B' | 'C' | 'D',
            text: line.substring(line.indexOf(':') + 1).trim()
          };
        } else if (currentSegment.speaker) {
          // Append to current segment text
          currentSegment.text = `${currentSegment.text || ''} ${line.trim()}`;
        }
      }
      
      // Add final segment if exists
      if (currentSegment.speaker && currentSegment.text) {
        segments.push({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          speaker: currentSegment.speaker,
          text: currentSegment.text.trim()
        });
      }

      if (segments.length === 0) {
        throw new Error('No valid transcript segments found in file');
      }

      onUpload(segments);
      toast.success('Transcript uploaded successfully');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error parsing transcript:', error);
      toast.error('Failed to parse transcript file. Please check the format.');
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".txt"
      onChange={handleFileSelect}
      className="hidden"
      id="transcript-upload"
    />
  );
};