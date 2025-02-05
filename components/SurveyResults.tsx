import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw, Trash2, Brain, MessageSquare } from 'lucide-react';
import { SurveyResponse, SiteConfig } from '../types';
import { supabase } from '../lib/supabase';
import { useOpenAI } from '../hooks/useOpenAI';
import { TranscriptChat } from './TranscriptChat';
import toast from 'react-hot-toast';

type Tab = 'analysis' | 'chat';

interface SurveyResultsProps {
  sessionId: string;
  siteName: string;
  onClose: () => void;
  openaiPrompt: string;
}

interface SupabaseResponse {
  id: string;
  question_id: string;
  answer: string;
  session_id: string;
  timestamp: string;
  site_name: string;
  created_at: string;
}

interface QuestionSummary {
  questionId: string;
  questionText: string;
  type: string;
  responses: {
    answer: string;
    count: number;
    percentage: number;
  }[];
  totalResponses: number;
}

export const SurveyResults: React.FC<SurveyResultsProps> = ({
  sessionId,
  siteName,
  onClose,
  openaiPrompt
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingResponses, setAnalyzingResponses] = useState(false);
  const { sendToOpenAI } = useOpenAI();

  const fetchSiteConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_configs')
        .select('*')
        .eq('name', siteName)
        .single();

      if (error) throw error;
      setSiteConfig(data);
    } catch (error) {
      console.error('Error fetching site config:', error);
      toast.error('Failed to fetch site configuration');
    }
  };

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('site_name', siteName);

      if (supabaseError) throw supabaseError;

      const mappedResponses = (data || []).map((response: SupabaseResponse) => ({
        id: response.id,
        questionId: response.question_id,
        answer: response.answer,
        timestamp: new Date(response.timestamp).toLocaleString(),
        sessionId: response.session_id
      }));

      setResponses(mappedResponses);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch survey responses';
      console.error('Error in fetchResponses:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchSiteConfig(), fetchResponses()]);
    
    const subscription = supabase
      .channel('survey_responses_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'survey_responses'
        },
        () => {
          fetchResponses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [siteName]);

  const clearResponses = async () => {
    if (!confirm('Are you sure you want to clear all survey responses?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('survey_responses')
        .delete()
        .eq('site_name', siteName);

      if (deleteError) throw deleteError;

      toast.success('Survey responses cleared successfully');
      setResponses([]);
      setAiAnalysis(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear survey responses';
      console.error('Error clearing survey responses:', error);
      toast.error(errorMessage);
    }
  };

  const exportResults = () => {
    try {
      const data = JSON.stringify(responses, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-results-${siteName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
    }
  };

  const summarizeResponses = (): QuestionSummary[] => {
    if (!siteConfig?.survey_config?.questions) return [];

    return siteConfig.survey_config.questions.map(question => {
      const questionResponses = responses.filter(r => r.questionId === question.id);
      const totalResponses = questionResponses.length;

      if (question.type === 'multiple_choice' && question.options) {
        const answerCounts = question.options.map(option => {
          const count = questionResponses.filter(r => r.answer === option).length;
          return {
            answer: option,
            count,
            percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
          };
        });

        return {
          questionId: question.id,
          questionText: question.text,
          type: question.type,
          responses: answerCounts,
          totalResponses
        };
      }

      return {
        questionId: question.id,
        questionText: question.text,
        type: question.type,
        responses: questionResponses.map(r => ({
          answer: r.answer,
          count: 1,
          percentage: 100
        })),
        totalResponses
      };
    });
  };

  const analyzeResponses = async () => {
    if (!siteConfig) {
      toast.error('Site configuration not loaded');
      return;
    }

    if (!siteConfig.openai_api_key) {
      toast.error('OpenAI API key not configured for this site');
      return;
    }

    if (!openaiPrompt) {
      toast.error('Survey analysis prompt not configured');
      return;
    }

    if (responses.length === 0) {
      toast.error('No responses to analyze');
      return;
    }

    setAnalyzingResponses(true);
    setAiAnalysis(null);

    try {
      const summaryData = summarizeResponses();
      
      if (summaryData.length === 0) {
        throw new Error('No survey data available for analysis');
      }

      const analysisText = summaryData.map(question => {
        const responseSummary = question.type === 'multiple_choice'
          ? question.responses.map(r => `${r.answer}: ${r.percentage.toFixed(1)}% (${r.count} responses)`).join('\n')
          : question.responses.map(r => r.answer).join('\n');

        return `Question: ${question.questionText}\nResponses:\n${responseSummary}\n`;
      }).join('\n---\n');

      const fullAnalysisText = `Survey Results Analysis\nTotal Responses: ${responses.length}\n\n${analysisText}`;
      const prompt = openaiPrompt.replace('{responses}', fullAnalysisText);
      
      if (!prompt.trim()) {
        throw new Error('Invalid analysis prompt');
      }

      const result = await sendToOpenAI(
        { 
          apiKey: siteConfig.openai_api_key, 
          prompt 
        },
        fullAnalysisText
      );

      if (!result || !result.response) {
        throw new Error('Invalid response from OpenAI service');
      }

      if (result.response.error) {
        throw new Error(result.response.error);
      }

      if (!result.response.data) {
        throw new Error('No analysis results received');
      }

      setAiAnalysis(result.response.data);
      toast.success('Analysis completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze responses';
      console.error('Error analyzing responses:', error);
      toast.error(errorMessage);
      setAiAnalysis(null);
    } finally {
      setAnalyzingResponses(false);
    }
  };

  const formatSurveyData = () => {
    const summaryData = summarizeResponses();
    return summaryData.map(question => {
      const responseSummary = question.type === 'multiple_choice'
        ? question.responses.map(r => `${r.answer}: ${r.percentage.toFixed(1)}% (${r.count} responses)`).join('\n')
        : question.responses.map(r => r.answer).join('\n');

      return `Question: ${question.questionText}\nResponses:\n${responseSummary}\n`;
    }).join('\n---\n');
  };

  const summaryData = summarizeResponses();

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Survey Results {responses.length > 0 && `(${responses.length} total responses)`}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'analysis'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Analysis
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat
                  </div>
                </button>
              </div>

              <button
                onClick={clearResponses}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Clear All Responses"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={fetchResponses}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh Results"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={exportResults}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Export Results"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchResponses}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No survey responses yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {analyzingResponses && (
                  <div className="flex items-center justify-center gap-3 py-4 text-purple-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-r-transparent" />
                    Analyzing responses...
                  </div>
                )}

                <div className={`transition-opacity duration-300 ${activeTab === 'analysis' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {!aiAnalysis && responses.length > 0 && !analyzingResponses && siteConfig?.openai_api_key && (
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={analyzeResponses}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Brain className="w-5 h-5" />
                        Analyze Responses
                      </button>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Analysis
                      </h3>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-900 text-base">
                          {aiAnalysis}
                        </pre>
                      </div>
                    </div>
                  )}

                  {summaryData.map((question) => (
                    <div key={question.questionId} className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {question.questionText}
                      </h3>
                      {question.type === 'multiple_choice' ? (
                        <div className="space-y-3">
                          {question.responses.map((response, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-48 text-gray-900">
                                {response.answer}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 transition-all duration-500"
                                      style={{ width: `${response.percentage}%` }}
                                    />
                                  </div>
                                  <div className="w-16 text-right text-gray-900">
                                    {response.percentage.toFixed(1)}%
                                  </div>
                                  <div className="w-16 text-right text-gray-500">
                                    ({response.count})
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="mt-2 text-sm text-gray-500">
                            Total responses: {question.totalResponses}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {question.responses.map((response, index) => (
                            <div key={index} className="text-gray-900">
                              {response.answer}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={`transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {siteConfig?.openai_api_key ? (
                    <TranscriptChat
                      transcript={formatSurveyData()}
                      apiKey={siteConfig.openai_api_key}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">OpenAI API key not configured. Please set up the API key in site settings.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
    </div>
  );
};