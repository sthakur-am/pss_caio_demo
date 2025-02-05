import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useTranscription } from './hooks/useTranscription';
import { TranscriptionSummary } from './components/TranscriptionSummary';
import { ScrollingTranscript } from './components/ScrollingTranscript';
import { OpenAIAnalysis } from './components/OpenAIAnalysis';
import { APIKeySetup } from './components/APIKeySetup';
import { AdminPanel } from './components/AdminPanel';
import { SurveyPage } from './components/SurveyPage';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { SurveyResults } from './components/SurveyResults';
import { configService } from './services/configService';
import { FileText, Download, Mic, BarChart2, Brain, X, Upload } from 'lucide-react';
import { WordCloud } from './components/WordCloud';
import { supabase } from './lib/supabase';
import { SiteConfig } from './types';
import { TranscriptUpload } from './components/TranscriptUpload';
import { LeftNavbar } from './components/LeftNavbar';
import toast from 'react-hot-toast';

function SiteVersion() {
  const { slug } = useParams<{ slug: string }>();
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [qrError, setQrError] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAPISetup, setShowAPISetup] = useState(!configService.loadConfig()?.apiKey);

  const {
    status,
    segments,
    recentText,
    summary,
    startTranscription,
    stopTranscription,
    showSummary,
    closeSummary,
    setTranscriptSegments
  } = useTranscription();

  const fullText = useMemo(() => segments.map(segment => segment.text).join(' '), [segments]);

  const surveyUrl = useMemo(() => {
    if (!siteConfig?.slug) return '';
    return `${window.location.origin}/${siteConfig.slug}/survey?session=${sessionId}`;
  }, [siteConfig?.slug, sessionId]);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('site_configs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          toast.error('Failed to load site configuration');
          return;
        }

        if (data) {
          setSiteConfig(data);
          document.title = `${data.client_name} - PSS AI`;
        } else {
          setError('Site configuration not found');
          toast.error('Site configuration not found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading the site');
        toast.error('An error occurred while loading the site');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteConfig();
  }, [slug]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: 'company' | 'client') => {
    const img = e.target as HTMLImageElement;
    img.src = type === 'company' 
      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alvarez_and_Marsal.png/220px-Alvarez_and_Marsal.png'
      : 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80';
    img.onerror = null;
  };

  const handleQRError = () => {
    setQrError(true);
    toast.error('Failed to load QR code');
  };

  const handleSaveTranscript = () => {
    if (!siteConfig) return;

    const transcriptContent = segments
      .map(segment => `[${segment.timestamp}] Speaker ${segment.speaker}: ${segment.text}\n`)
      .join('\n');

    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = siteConfig.client_name 
      ? `${siteConfig.client_name.toLowerCase().replace(/\s+/g, '-')}-transcript-${new Date().toISOString().split('T')[0]}.txt`
      : `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Transcript saved successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !siteConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Site</h1>
          <p className="text-gray-600">{error || 'Site configuration not found'}</p>
        </div>
      </div>
    );
  }

  if (showAPISetup) {
    return <APIKeySetup onComplete={() => setShowAPISetup(false)} />;
  }

  if (showAnalysis) {
    return (
      <OpenAIAnalysis 
        text={fullText}
        segments={segments}
        onClose={() => setShowAnalysis(false)}
        onRestart={startTranscription}
        configApiKey={siteConfig.openai_api_key}
        siteConfig={siteConfig}
      />
    );
  }

  if (showSummary) {
    return (
      <TranscriptionSummary 
        segments={segments}
        summary={summary}
        onClose={closeSummary}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        background: `${siteConfig.background_color || '#103c6d'} url(../../img/decor/bg-topo.svg) no-repeat 50%`,
        backgroundSize: 'cover'
      }}
    >
      <LeftNavbar
        logo={siteConfig.company_logo}
        companyName={siteConfig.company_name}
        buttons={[
          {
            icon: <Brain className="w-5 h-5" />,
            label: 'AI Tools',
            onClick: () => setShowAnalysis(true),
            variant: 'purple'
          },
          ...(status === 'recording' ? [{
            icon: <X className="w-5 h-5" />,
            label: 'Stop Recording',
            onClick: stopTranscription,
            variant: 'danger'
          }] : [
            {
              icon: <Mic className="w-5 h-5" />,
              label: 'Start Recording',
              onClick: startTranscription,
              variant: 'info'
            },
            {
              icon: <Upload className="w-5 h-5" />,
              label: 'Upload Transcript',
              onClick: () => document.getElementById('transcript-upload')?.click(),
              variant: 'info'
            }
          ]),
          ...(status === 'stopped' && segments.length > 0 ? [
            {
              icon: <Download className="w-5 h-5" />,
              label: 'Save Transcript',
              onClick: handleSaveTranscript,
              variant: 'info'
            }
          ] : [])
        ]}
        bottomButtons={[
          {
            icon: <BarChart2 className="w-5 h-5" />,
            label: 'View Survey Results',
            onClick: () => setShowSurveyResults(true),
            variant: 'warning'
          }
        ]}
        onImageError={(e) => handleImageError(e, 'company')}
      />

      <div className="flex-1">
        <div 
          className="w-full shadow-lg relative"
          style={{ backgroundColor: siteConfig.nav_bar_color || '#FFFFFF' }}
        >
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 flex items-center">
                  <img 
                    src={siteConfig.company_logo}
                    alt={`${siteConfig.company_name} Logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => handleImageError(e, 'company')}
                    loading="eager"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 
                    className="text-lg font-bold leading-tight"
                    style={{ color: siteConfig.title_color || '#000000' }}
                  >
                    {siteConfig.company_name}
                  </h1>
                  <span 
                    className="text-base"
                    style={{ color: siteConfig.title_color || '#000000' }}
                  >
                    Public Sector Artificial Intelligence
                  </span>
                </div>
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className="h-16 w-32 flex items-center justify-center">
                  <img 
                    src={siteConfig.client_logo}
                    alt={`${siteConfig.client_name} Logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => handleImageError(e, 'client')}
                    loading="eager"
                  />
                </div>
              </div>

              {(siteConfig.qr_code_url || (siteConfig.survey_config && !qrError)) && (
                <div style={{ position: 'absolute', top: '10px', right: '19px' }}>
                  <QRCodeDisplay
                    surveyUrl={surveyUrl}
                    config={siteConfig.survey_config || {
                      questions: [],
                      openaiPrompt: '',
                      qrCodeSize: 128,
                      qrCodeColor: '#000000'
                    }}
                    customUrl={siteConfig.qr_code_url}
                    onError={handleQRError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-8 h-[calc(100vh-5rem)] flex flex-col">
          <div className="flex-1 w-full flex items-center justify-center p-4">
            <div className="w-full max-h-[500px]">
              <WordCloud 
                text={fullText}
                width={Math.min(1200, Math.floor(window.innerWidth * 0.8))}
                height={Math.min(500, Math.floor(window.innerHeight * 0.5))}
                backgroundColor={siteConfig.word_cloud_background_color}
                textColor={siteConfig.word_cloud_text_color}
              />
            </div>
          </div>

          <div className="h-20 w-full px-4 mb-4">
            <ScrollingTranscript
              segments={segments}
              recentText={recentText}
              textColor={siteConfig.transcript_color}
              fontSize={siteConfig.transcript_font_size}
              maxLines={1}
            />
          </div>
        </div>

        {showSurveyResults && (
          <SurveyResults
            sessionId={sessionId}
            siteName={siteConfig.name}
            onClose={() => setShowSurveyResults(false)}
            openaiPrompt={siteConfig.survey_config?.openaiPrompt || ''}
          />
        )}

        <div 
          className="fixed bottom-4 right-4 text-sm font-medium"
          style={{ color: siteConfig.title_color || '#FFFFFF' }}
        >
          Office of the CAIO
        </div>
      </div>

      <TranscriptUpload onUpload={setTranscriptSegments} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/:slug/survey" element={<SurveyPage />} />
        <Route path="/:slug" element={<SiteVersion />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;