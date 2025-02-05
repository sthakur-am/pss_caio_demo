import React from 'react';
import { Mic, MicOff, FileText } from 'lucide-react';
import { TranscriptionStatus } from '../types';

interface TranscriptionControlsProps {
  status: TranscriptionStatus;
  onStartTranscription: () => void;
  onStopTranscription: () => void;
  onGenerateSummary: () => void;
  canGenerateSummary: boolean;
}

export const TranscriptionControls: React.FC<TranscriptionControlsProps> = ({
  status,
  onStartTranscription,
  onStopTranscription,
  onGenerateSummary,
  canGenerateSummary
}) => {
  return (
    <div className="flex gap-4 justify-center mb-6">
      {status === 'recording' ? (
        <button
          onClick={onStopTranscription}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <MicOff className="w-5 h-5" />
          Stop Transcription
        </button>
      ) : (
        <button
          onClick={onStartTranscription}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={status === 'error'}
        >
          <Mic className="w-5 h-5" />
          Start Transcription
        </button>
      )}
      
      <button
        onClick={onGenerateSummary}
        disabled={!canGenerateSummary}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors
          ${canGenerateSummary 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        <FileText className="w-5 h-5" />
        Generate Summary
      </button>
    </div>
  );
};