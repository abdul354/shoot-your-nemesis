import React from 'react';
import { ScoreEntry } from '../types';

interface LeaderboardProps {
  scores: ScoreEntry[];
  onClear: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onClear }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {scores.map((entry, index) => (
          <div 
            key={entry.id}
            className={`
              relative flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded
              hover:bg-gray-800/50 hover:border-gray-600 transition-colors group
              ${index === 0 ? 'border-l-4 border-l-white bg-white/5' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <span className="font-cyber text-lg w-6 text-gray-500">{index + 1}.</span>
              <span className="font-bold tracking-wide text-gray-200 group-hover:text-white group-hover:text-glow transition-all">
                {entry.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-cyber text-white">{entry.score}</div>
              <div className="text-xs text-gray-500 font-mono">({entry.accuracy}%)</div>
            </div>
            
            {/* Scanline decoration on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transform" style={{transition: 'transform 1s linear, opacity 0.3s'}}></div>
          </div>
        ))}
        
        {scores.length === 0 && (
            <div className="text-center py-10 text-gray-600 font-cyber text-sm">
                NO DATA AVAILABLE
            </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center">
        <button 
          onClick={onClear}
          className="text-xs md:text-sm text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-white pb-1"
        >
          Clear Leaderboard
        </button>
      </div>
    </div>
  );
};