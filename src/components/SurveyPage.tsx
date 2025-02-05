import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SurveyForm } from './SurveyForm';
import { SiteConfig } from '../types';
import { supabase } from '../lib/supabase';

export const SurveyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('site_configs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setConfig(data);
      } catch (error) {
        console.error('Error fetching site config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!config || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Survey Link</h1>
          <p className="text-gray-600">This survey link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-600">Your feedback has been recorded.</p>
        </div>
      </div>
    );
  }

  if (!config.survey_config?.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Survey Not Available</h1>
          <p className="text-gray-600">This survey is not currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <img 
            src={config.client_logo}
            alt={`${config.client_name} Logo`}
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-center text-gray-900">
            {config.client_name} Survey
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Please take a moment to complete this survey.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SurveyForm
            questions={config.survey_config.questions}
            sessionId={sessionId}
            siteName={config.name}
            onSubmit={() => setSubmitted(true)}
          />
        </div>
      </div>
    </div>
  );
};