import React, { useState } from 'react';
import { Key, Save } from 'lucide-react';
import { configService } from '../services/configService';

interface APIKeySetupProps {
  onComplete: () => void;
}

export const APIKeySetup: React.FC<APIKeySetupProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate API key format
      if (!apiKey.trim()) {
        throw new Error('API key is required');
      }
      
      if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-')) {
        throw new Error('Invalid API key format. Key should start with "sk-" or "sk-proj-"');
      }

      if (apiKey.length < 40) {
        throw new Error('API key seems too short. Please check your key.');
      }

      // Save the API key
      configService.saveConfig({ apiKey, prompt: '' });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid API key');
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-8" style={{ background: '#103c6d url(../../img/decor/bg-topo.svg) no-repeat 50%' }}>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://www.afcea.org/signal/resources/content/_AFCEA_ResourceLibrary_Logo.jpg" 
            alt="Logo" 
            className="w-48 h-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-center">
            Alvarez & Marsal - Public Sector Artificial Intelligence
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold">OpenAI API Key Setup</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:border-blue-500 focus:ring focus:ring-blue-500/20"
                placeholder="sk-..."
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
              <p className="mt-2 text-sm text-gray-300">
                Your API key will be stored locally and used only for transcript analysis.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save API Key
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="fixed bottom-4 right-4 text-white text-lg font-semibold">
          Office of the CAIO
        </div>
      </div>
    </div>
  );
};