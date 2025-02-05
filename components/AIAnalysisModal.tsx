import React from 'react';
import { Brain, X, Clock, ArrowRight } from 'lucide-react';
import { SiteConfig } from '../types';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeTranscript: () => void;
  onAnalyzeSurvey: () => void;
  siteConfig: SiteConfig;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeTranscript,
  onAnalyzeSurvey,
  siteConfig
}) => {
  if (!isOpen) return null;

  const analysisTypes = [
    {
      title: 'Transcript Analysis',
      description: 'Analyze meeting transcripts for key insights, action items, and themes',
      estimatedTime: '1-2 minutes',
      onClick: onAnalyzeTranscript,
      prompt: siteConfig.default_analysis_prompt
    },
    {
      title: 'Survey Results Analysis',
      description: 'Analyze survey responses for trends, patterns, and actionable insights',
      estimatedTime: '1-2 minutes',
      onClick: onAnalyzeSurvey,
      prompt: siteConfig.survey_config?.openaiPrompt
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Analysis Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {analysisTypes.map((type, index) => (
            <div
              key={index}
              className="border rounded-lg p-6 hover:border-purple-300 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                  <p className="text-gray-600">{type.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Estimated processing time: {type.estimatedTime}
                  </div>
                </div>
                <button
                  onClick={type.onClick}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Execute
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {type.prompt && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Analysis Prompt:</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {type.prompt}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};