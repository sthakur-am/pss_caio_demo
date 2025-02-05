import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SurveyConfig } from '../types';
import { ExternalLink } from 'lucide-react';

interface QRCodeDisplayProps {
  surveyUrl: string;
  config: SurveyConfig;
  customUrl?: string; // Add new prop
  onError?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  surveyUrl, 
  config,
  customUrl,
  onError 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(customUrl || surveyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg p-3">
      <div className="mb-2">
        <QRCodeSVG
          value={customUrl || surveyUrl}
          size={config.qrCodeSize || 128}
          fgColor={config.qrCodeColor || '#000000'}
          bgColor="#FFFFFF"
          level="H"
          includeMargin={false}
          onError={onError}
          imageSettings={
            config.qrCodeLogo
              ? {
                  src: config.qrCodeLogo,
                  height: 24,
                  width: 24,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        {customUrl ? 'Open Link' : 'Take Survey'}
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};