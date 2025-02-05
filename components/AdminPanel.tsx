import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteConfig, SiteConfigFormData } from '../types';
import { Settings, Plus, Edit2, Trash2, Globe, ExternalLink, Link, Image } from 'lucide-react';
import { SurveyConfigForm } from './SurveyConfigForm';
import { FileUpload } from './FileUpload';
import toast from 'react-hot-toast';

const DEFAULT_LOGOS = {
  clientLogo: 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80',
  companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alvarez_and_Marsal.png/220px-Alvarez_and_Marsal.png'
} as const;

export function AdminPanel() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(null);
  const [formData, setFormData] = useState<SiteConfigFormData>({
    name: '',
    slug: '',
    clientName: '',
    clientLogo: DEFAULT_LOGOS.clientLogo,
    companyLogo: DEFAULT_LOGOS.companyLogo,
    companyName: '',
    backgroundColor: '#103c6d',
    titleColor: '#FFFFFF',
    transcriptColor: '#FFFFFF',
    transcriptFontSize: '40px',
    wordCloudBackgroundColor: 'rgba(0, 0, 0, 0.2)',
    wordCloudTextColor: '#FFFFFF',
    wordCloudPosition: {
      top: '32px',
      right: '16px'
    },
    wordCloudSize: {
      width: 300,
      height: 200
    },
    shortenedUrl: '',
    navBarColor: '#FFFFFF',
    qrCodeUrl: '',
    contextFiles: [],
    surveyConfig: {
      questions: [],
      openaiPrompt: 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
      qrCodeSize: 128,
      qrCodeColor: '#000000'
    }
  });

  useEffect(() => {
    document.title = "Alvarez & Marsal PSS AI - Site Configurations";
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const { data, error } = await supabase
      .from('site_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load configurations');
      return;
    }

    // Ensure logos are set
    const configsWithLogos = data?.map(config => ({
      ...config,
      client_logo: config.client_logo || DEFAULT_LOGOS.clientLogo,
      company_logo: config.company_logo || DEFAULT_LOGOS.companyLogo
    })) || [];

    setConfigs(configsWithLogos);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const dbData = {
      name: formData.name,
      slug,
      client_name: formData.clientName,
      client_logo: formData.clientLogo,
      company_logo: formData.companyLogo,
      company_name: formData.companyName,
      openai_api_key: formData.openaiApiKey || null,
      background_color: formData.backgroundColor,
      title_color: formData.titleColor,
      transcript_color: formData.transcriptColor,
      transcript_font_size: formData.transcriptFontSize,
      word_cloud_background_color: formData.wordCloudBackgroundColor,
      word_cloud_text_color: formData.wordCloudTextColor,
      word_cloud_position: formData.wordCloudPosition,
      word_cloud_size: formData.wordCloudSize,
      shortened_url: formData.shortenedUrl || null,
      nav_bar_color: formData.navBarColor,
      qr_code_url: formData.qrCodeUrl || null,
      survey_config: formData.surveyConfig
    };

    try {
      if (editingConfig) {
        const { error } = await supabase
          .from('site_configs')
          .update(dbData)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Configuration updated successfully');
      } else {
        const { error } = await supabase
          .from('site_configs')
          .insert([dbData]);

        if (error) throw error;
        toast.success('Configuration created successfully');
      }

      setShowForm(false);
      setEditingConfig(null);
      setFormData({
        name: '',
        slug: '',
        clientName: '',
        clientLogo: DEFAULT_LOGOS.clientLogo,
        companyLogo: DEFAULT_LOGOS.companyLogo,
        companyName: '',
        backgroundColor: '#103c6d',
        titleColor: '#FFFFFF',
        transcriptColor: '#FFFFFF',
        transcriptFontSize: '40px',
        wordCloudBackgroundColor: 'rgba(0, 0, 0, 0.2)',
        wordCloudTextColor: '#FFFFFF',
        wordCloudPosition: {
          top: '32px',
          right: '16px'
        },
        wordCloudSize: {
          width: 300,
          height: 200
        },
        shortenedUrl: '',
        navBarColor: '#FFFFFF',
        qrCodeUrl: '',
        contextFiles: [],
        surveyConfig: {
          questions: [],
          openaiPrompt: 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
          qrCodeSize: 128,
          qrCodeColor: '#000000'
        }
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (config: SiteConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name || '',
      slug: config.slug || '',
      clientName: config.client_name || '',
      clientLogo: config.client_logo || DEFAULT_LOGOS.clientLogo,
      companyLogo: config.company_logo || DEFAULT_LOGOS.companyLogo,
      companyName: config.company_name || '',
      openaiApiKey: config.openai_api_key || '',
      backgroundColor: config.background_color || '#103c6d',
      titleColor: config.title_color || '#FFFFFF',
      transcriptColor: config.transcript_color || '#FFFFFF',
      transcriptFontSize: config.transcript_font_size || '40px',
      wordCloudBackgroundColor: config.word_cloud_background_color || 'rgba(0, 0, 0, 0.2)',
      wordCloudTextColor: config.word_cloud_text_color || '#FFFFFF',
      wordCloudPosition: config.word_cloud_position || {
        top: '32px',
        right: '16px'
      },
      wordCloudSize: config.word_cloud_size || {
        width: 300,
        height: 200
      },
      shortenedUrl: config.shortened_url || '',
      navBarColor: config.nav_bar_color || '#FFFFFF',
      qrCodeUrl: config.qr_code_url || '',
      contextFiles: [],
      surveyConfig: config.survey_config || {
        questions: [],
        openaiPrompt: 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
        qrCodeSize: 128,
        qrCodeColor: '#000000'
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    const { error } = await supabase
      .from('site_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to delete configuration');
      return;
    }

    toast.success('Configuration deleted');
    fetchConfigs();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    img.src = DEFAULT_LOGOS.clientLogo;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <img 
                src={DEFAULT_LOGOS.companyLogo}
                alt="Alvarez & Marsal Logo"
                className="h-12"
                onError={handleImageError}
              />
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Site Configurations</h1>
                  <p className="text-sm text-gray-600">Public Sector Solutions AI Practice</p>
                </div>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Configuration
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingConfig ? 'Edit Configuration' : 'New Configuration'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.clientLogo}
                    onChange={(e) => setFormData({ ...formData, clientLogo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.companyLogo}
                    onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.openaiApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shortened URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.shortenedUrl || ''}
                    onChange={(e) => setFormData({ ...formData, shortenedUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://short.url/xyz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.qrCodeUrl || ''}
                    onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/qr-code"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    If provided, this QR code will be displayed on all pages
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Theme Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#103c6d"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transcript Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.transcriptColor}
                        onChange={(e) => setFormData({ ...formData, transcriptColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.transcriptColor}
                        onChange={(e) => setFormData({ ...formData, transcriptColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Navigation Bar Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.navBarColor}
                        onChange={(e) => setFormData({ ...formData, navBarColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.navBarColor}
                        onChange={(e) => setFormData({ ...formData, navBarColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transcript Font Size
                    </label>
                    <input
                      type="text"
                      value={formData.transcriptFontSize}
                      onChange={(e) => setFormData({ ...formData, transcriptFontSize: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="40px"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Word Cloud Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.wordCloudBackgroundColor}
                        onChange={(e) => setFormData({ ...formData, wordCloudBackgroundColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.wordCloudBackgroundColor}
                        onChange={(e) => setFormData({ ...formData, wordCloudBackgroundColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="rgba(0, 0, 0, 0.2)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.wordCloudTextColor}
                        onChange={(e) => setFormData({ ...formData, wordCloudTextColor: e.target.value })}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={formData.wordCloudTextColor}
                        onChange={(e) => setFormData({ ...formData, wordCloudTextColor: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.wordCloudPosition?.top}
                        onChange={(e) => setFormData({
                          ...formData,
                          wordCloudPosition: {
                            ...formData.wordCloudPosition,
                            top: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Top (32px)"
                      />
                      <input
                        type="text"
                        value={formData.wordCloudPosition?.right}
                        onChange={(e) => setFormData({
                          ...formData,
                          wordCloudPosition: {
                            ...formData.wordCloudPosition,
                            right: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Right (16px)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={formData.wordCloudSize?.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          wordCloudSize: {
                            ...formData.wordCloudSize,
                            width: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Width (300)"
                      />
                      <input
                        type="number"
                        value={formData.wordCloudSize?.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          wordCloudSize: {
                            ...formData.wordCloudSize,
                            height: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Height (200)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Context Files</h3>
                <FileUpload
                  onFilesProcessed={(files) => setFormData({ ...formData, contextFiles: files })}
                  existingFiles={formData.contextFiles}
                />
              </div>

              <SurveyConfigForm
                config={formData.surveyConfig || {
                  questions: [],
                  openaiPrompt: 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
                  qrCodeSize: 128,
                  qrCodeColor: '#000000'
                }}
                onChange={(surveyConfig) => setFormData({ ...formData, surveyConfig })}
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {configs.map((config) => (
            <div
              key={config.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {config.client_logo ? (
                      <img 
                        src={config.client_logo}
                        alt={`${config.client_name} Logo`}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {config.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4" />
                            <a
                              href={`/${config.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {window.location.origin}/{config.slug}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          {config.shortened_url && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Link className="w-4 h-4" />
                              <a
                                href={config.shortened_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {config.shortened_url}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Client</p>
                            <p>{config.client_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Company</p>
                            <p>{config.company_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}