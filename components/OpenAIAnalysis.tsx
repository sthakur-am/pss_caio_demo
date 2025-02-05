import React, { useEffect, useState } from 'react';
import { Loader2, X, FileText, Download, Mic, BarChart2, Settings, Brain, Printer, MessageSquare } from 'lucide-react';
import { useOpenAI } from '../hooks/useOpenAI';
import { configService } from '../services/configService';
import { TranscriptionSegment, SiteConfig } from '../types';
import { LeftNavbar } from './LeftNavbar';
import { TranscriptChat } from './TranscriptChat';
import toast from 'react-hot-toast';

type Tab = 'analysis' | 'chat';

interface OpenAIAnalysisProps {
  text: string;
  segments: TranscriptionSegment[];
  onClose: () => void;
  onRestart: () => void;
  configApiKey?: string;
  siteConfig: SiteConfig;
}

const FALLBACK_IMAGES = {
  COMPANY_LOGO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alvarez_and_Marsal.png/220px-Alvarez_and_Marsal.png',
  CLIENT_LOGO: 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80'
} as const;

export const OpenAIAnalysis: React.FC<OpenAIAnalysisProps> = ({ 
  text, 
  segments,
  onClose, 
  onRestart,
  configApiKey,
  siteConfig
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const { response, sendToOpenAI, DEFAULT_PROMPT } = useOpenAI(configApiKey);
  const [showSurveyResults, setShowSurveyResults] = React.useState(false);

  useEffect(() => {
    document.title = `${siteConfig.client_name} - AI Analysis`;

    const analyzeTranscript = async () => {
      const config = configService.loadConfig();
      if (!configApiKey && !config?.apiKey) {
        toast.error('Please set up your OpenAI API key first');
        onClose();
        return;
      }

      const transcriptText = segments
        .map(s => `Speaker ${s.speaker} (${s.timestamp}): ${s.text}`)
        .join('\n')
        .trim();

      if (!transcriptText) {
        toast.error('No transcript text available for analysis');
        onClose();
        return;
      }

      await sendToOpenAI(
        { 
          apiKey: config?.apiKey || '', 
          prompt: DEFAULT_PROMPT 
        }, 
        transcriptText
      );
    };

    analyzeTranscript();
  }, [text, sendToOpenAI, DEFAULT_PROMPT, onClose, configApiKey, siteConfig.client_name, segments]);

  const handleSaveTranscript = () => {
    const transcriptContent = segments
      .map(segment => `[${segment.timestamp}] Speaker ${segment.speaker}:\n${segment.text}\n`)
      .join('\n');

    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteConfig.client_name.toLowerCase().replace(/\s+/g, '-')}-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to export PDF.');
      return;
    }

    const analysisContent = document.getElementById('analysis-content');
    if (!analysisContent) {
      toast.error('Analysis content not found');
      return;
    }

    const style = `
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 210mm;
          margin: 0 auto;
          padding: 2cm;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2cm;
          padding-bottom: 1cm;
          border-bottom: 1px solid #e5e5e5;
        }
        .logo {
          height: 50px;
          object-fit: contain;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
          margin: 0;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
        }
        .analysis {
          font-size: 14px;
          white-space: pre-wrap;
        }
        .footer {
          position: fixed;
          bottom: 2cm;
          left: 2cm;
          right: 2cm;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${siteConfig.client_name} - AI Analysis</title>
          ${style}
        </head>
        <body>
          <div class="header">
            <img src="${siteConfig.company_logo}" alt="Company Logo" class="logo" onerror="this.src='${FALLBACK_IMAGES.COMPANY_LOGO}'"/>
            <div style="text-align: center;">
              <h1 class="title">${siteConfig.client_name}</h1>
              <p class="subtitle">AI Analysis Report</p>
              <p class="subtitle">${new Date().toLocaleDateString()}</p>
            </div>
            <img src="${siteConfig.client_logo}" alt="Client Logo" class="logo" onerror="this.src='${FALLBACK_IMAGES.CLIENT_LOGO}'"/>
          </div>
          <div class="analysis">
            ${response.data}
          </div>
          <div class="footer">
            Generated by ${siteConfig.company_name} - Public Sector AI Practice
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: 'company' | 'client') => {
    const img = e.target as HTMLImageElement;
    img.src = type === 'company' ? FALLBACK_IMAGES.COMPANY_LOGO : FALLBACK_IMAGES.CLIENT_LOGO;
    img.onerror = null;
  };

  return (
    <div 
      className="min-h-screen text-white flex"
      style={{ 
        background: `${siteConfig.background_color || '#103c6d'} url(../../img/decor/bg-topo.svg) no-repeat 50%` 
      }}
    >
      <LeftNavbar
        logo={siteConfig.company_logo}
        companyName={siteConfig.company_name}
        onImageError={(e) => handleImageError(e, 'company')}
        buttons={[
          {
            icon: <Brain className="w-5 h-5" />,
            label: 'AI Analysis',
            onClick: () => setActiveTab('analysis'),
            variant: activeTab === 'analysis' ? 'purple' : 'default'
          },
          {
            icon: <MessageSquare className="w-5 h-5" />,
            label: 'Chat',
            onClick: () => setActiveTab('chat'),
            variant: activeTab === 'chat' ? 'purple' : 'default'
          },
          {
            icon: <X className="w-5 h-5" />,
            label: 'Close Analysis',
            onClick: onClose,
            variant: 'danger'
          },
          ...(response.data ? [
            {
              icon: <Printer className="w-5 h-5" />,
              label: 'Export as PDF',
              onClick: handlePrint,
              variant: 'success'
            },
            {
              icon: <Download className="w-5 h-5" />,
              label: 'Save Transcript',
              onClick: handleSaveTranscript,
              variant: 'info'
            },
            {
              icon: <Mic className="w-5 h-5" />,
              label: 'Restart Transcription',
              onClick: onRestart,
              variant: 'info'
            }
          ] : [])
        ]}
        bottomButtons={[
          {
            icon: <BarChart2 className="w-5 h-5" />,
            label: 'Survey Results',
            onClick: () => setShowSurveyResults(true),
            variant: 'warning'
          },
          {
            icon: <Settings className="w-5 h-5" />,
            label: 'Admin Panel',
            onClick: () => window.location.href = '/admin'
          }
        ]}
      />

      <div className="flex-1">
        <div 
          className="h-16 border-b border-white/10 flex items-center justify-between px-8"
          style={{ backgroundColor: siteConfig.nav_bar_color || '#FFFFFF20' }}
        >
          <div className="flex items-center gap-4">
            <img 
              src={siteConfig.client_logo}
              alt={`${siteConfig.client_name} Logo`}
              className="h-8 w-auto"
              onError={(e) => handleImageError(e, 'client')}
            />
            <div className="flex items-center gap-2">
              <h2 
                className="text-lg font-medium"
                style={{ color: siteConfig.title_color || '#000000' }}
              >
                {siteConfig.client_name}
              </h2>
              <span 
                className="mx-2"
                style={{ color: siteConfig.title_color || '#000000' }}
              >
                |
              </span>
              <h2 
                className="text-lg font-bold"
                style={{ color: siteConfig.title_color || '#000000' }}
              >
                {siteConfig.name}
              </h2>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-white text-purple-600 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-purple-600 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto pt-8 px-8">
          <div className="space-y-6">
            {response.status === 'loading' && (
              <div className="flex items-center justify-center p-12">
                <div className="flex items-center gap-3 text-xl" style={{ color: siteConfig.title_color || '#FFFFFF' }}>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Analyzing transcript...
                </div>
              </div>
            )}

            {response.error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Analysis Error</h2>
                <p>{response.error}</p>
              </div>
            )}

            {response.data && (
              <div className={`transition-opacity duration-300 ${activeTab === 'analysis' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <div 
                  id="analysis-content"
                  className="backdrop-blur rounded-lg p-8 bg-white shadow-lg"
                >
                  <h2 
                    className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900"
                  >
                    <Brain className="w-6 h-6 text-purple-600" />
                    Analysis Results
                  </h2>
                  <div className="prose max-w-none">
                    <pre 
                      className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-800"
                    >
                      {response.data}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className={`transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <TranscriptChat 
                transcript={text}
                apiKey={configApiKey || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};