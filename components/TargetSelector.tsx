import React from 'react';
import { Target } from '../types';

interface TargetSelectorProps {
  targets: Target[];
  selectedTargetId: string | null;
  onSelect: (id: string) => void;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({ targets, selectedTargetId, onSelect }) => {
  return (
    <div className="flex justify-center items-center gap-4 md:gap-8 my-8">
      {targets.map((target) => {
        const isSelected = selectedTargetId === target.id;
        const isComingSoon = target.status === 'coming-soon';

        return (
          <div key={target.id} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => !isComingSoon && onSelect(target.id)}>
            <div 
              className={`
                relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300
                ${isSelected ? 'shadow-[0_0_25px_rgba(255,255,255,0.6)] border-2 border-white scale-110' : 'border border-gray-700 hover:border-gray-400'}
                ${isComingSoon ? 'opacity-50 cursor-not-allowed border-dashed' : 'bg-black'}
              `}
            >
              {/* Outer Ring Animation for Selected */}
              {isSelected && (
                <div className="absolute inset-[-4px] rounded-full border border-white/30 animate-pulse"></div>
              )}

              {target.imageUrl ? (
                <img 
                  src={target.imageUrl} 
                  alt={target.name} 
                  className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <span className="text-2xl font-cyber text-gray-500">?</span>
              )}
            </div>
            
            <div className="text-center">
                <span 
                    className={`
                        block text-[10px] md:text-xs tracking-widest font-cyber uppercase
                        ${isSelected ? 'text-white text-glow' : 'text-gray-500'}
                    `}
                >
                    {target.name}
                </span>
                {isComingSoon && (
                    <span className="block text-[8px] text-gray-600 uppercase mt-0.5">Soon</span>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};