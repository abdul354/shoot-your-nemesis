import React from 'react';

interface CyberContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const CyberContainer: React.FC<CyberContainerProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative p-1 ${className}`}>
      {/* Outer Glow Border */}
      <div className="absolute inset-0 border border-gray-800 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-sm z-0"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg z-10"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg z-10"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg z-10"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg z-10"></div>

      {/* Side Notches */}
      <div className="absolute top-1/2 left-0 w-1 h-12 -translate-y-1/2 bg-gray-800 z-10"></div>
      <div className="absolute top-1/2 right-0 w-1 h-12 -translate-y-1/2 bg-gray-800 z-10"></div>

      {/* Content */}
      <div className="relative z-20 p-6 h-full flex flex-col">
        {title && (
            <h2 className="text-center font-cyber text-lg tracking-[0.2em] text-gray-300 mb-6 uppercase border-b border-gray-800 pb-2">
              {title}
            </h2>
        )}
        {children}
      </div>
    </div>
  );
};