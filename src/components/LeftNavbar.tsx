import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'purple';
}

interface LeftNavbarProps {
  logo: string;
  companyName: string;
  buttons: NavButton[];
  bottomButtons: NavButton[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const LeftNavbar: React.FC<LeftNavbarProps> = ({
  logo,
  companyName,
  buttons,
  bottomButtons,
  onImageError
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getButtonStyle = (variant: NavButton['variant'] = 'default') => {
    const baseStyle = "w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200";
    
    switch (variant) {
      case 'danger':
        return `${baseStyle} bg-red-500/20 text-red-300 hover:bg-red-500/30`;
      case 'success':
        return `${baseStyle} bg-green-500/20 text-green-300 hover:bg-green-500/30`;
      case 'warning':
        return `${baseStyle} bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30`;
      case 'info':
        return `${baseStyle} bg-blue-500/20 text-blue-300 hover:bg-blue-500/30`;
      case 'purple':
        return `${baseStyle} bg-purple-600 text-white hover:bg-purple-700`;
      default:
        return `${baseStyle} bg-white/10 text-white/70 hover:bg-white/20`;
    }
  };

  return (
    <div 
      className={`relative transition-all duration-300 ease-in-out flex flex-col border-r border-gray-700 ${
        isExpanded ? 'w-64' : 'w-18'
      }`}
      style={{
        background: 'rgb(3,12,32)',
        background: 'linear-gradient(353deg, rgba(3,12,32,1) 0%, rgba(9,43,121,1) 35%, rgba(12,67,105,1) 100%)'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-gray-700 rounded-full p-1 text-white hover:bg-gray-600 transition-colors z-10"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Header */}
      <div className={`p-4 ${isExpanded ? '' : 'items-center'}`}>
        <div className="flex items-center mb-6">
          <img 
            src={logo}
            alt={`${companyName} Logo`}
            className={`h-8 w-auto ${isExpanded ? 'mb-2' : ''}`}
            onError={onImageError}
          />
          {isExpanded && (
            <h1 className="text-sm font-medium text-white/60 ml-2">
              {companyName}
            </h1>
          )}
        </div>

        {/* Main Buttons */}
        <div className="space-y-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={getButtonStyle(button.variant)}
              title={!isExpanded ? button.label : undefined}
            >
              <div className="min-w-[20px] flex justify-center">
                {button.icon}
              </div>
              {isExpanded && <span>{button.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className={`mt-auto p-4 space-y-2 ${isExpanded ? '' : 'items-center'}`}>
        {bottomButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={getButtonStyle(button.variant)}
            title={!isExpanded ? button.label : undefined}
          >
            <div className="min-w-[20px] flex justify-center">
              {button.icon}
            </div>
            {isExpanded && <span>{button.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};