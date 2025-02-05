import React from 'react';
import { Mic, MicOff, FileText, UserRound } from 'lucide-react';
import { TranscriptionStatus, Speaker } from '../types';
import { AutoResizingText } from './AutoResizingText';

interface FullscreenTranscriptionProps {
  status: TranscriptionStatus;
  recentText: string;
  currentSpeaker: Speaker;
  onStart: () => void;
  onStop: () => void;
  onToggleSpeaker: () => void;
  onGenerateSummary: () => void;
  canGenerateSummary: boolean;
}

export const FullscreenTranscription: React.FC<FullscreenTranscriptionProps> = ({
  status,
  recentText,
  currentSpeaker,
  onStart,
  onStop,
  onToggleSpeaker,
  onGenerateSummary,
  canGenerateSummary
}) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
      {status === 'recording' ? (
        <>
          <AutoResizingText text={recentText || `Speaker ${currentSpeaker} is speaking...`} />
          <div className="fixed top-8 right-8 flex items-center gap-4">
            <button
              onClick={onToggleSpeaker}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserRound className="w-5 h-5" />
              Speaker {currentSpeaker}
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              Stop
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {status !== 'error' && (
            <button
              onClick={onStart}
              className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xl"
            >
              <Mic className="w-6 h-6" />
              Start Transcription
            </button>
          )}
          
          {canGenerateSummary && (
            <button
              onClick={onGenerateSummary}
              className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xl"
            >
              <FileText className="w-6 h-6" />
              Generate Transcript
            </button>
          )}

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg max-w-md text-center">
              Speech recognition is not supported in your browser. Please try using Chrome.
            </div>
          )}
        </div>
      )}
    </div>
  );
};