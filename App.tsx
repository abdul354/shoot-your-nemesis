import React, { useState, useEffect } from 'react';
import { CyberContainer } from './components/CyberContainer';
import { TargetSelector } from './components/TargetSelector';
import { Leaderboard } from './components/Leaderboard';
import { ScoreEntry, Target } from './types';
// @ts-ignore
import { startGame } from './js/Main.js';

// Mock Initial Data
const INITIAL_SCORES: ScoreEntry[] = [
  { id: '1', name: 'PLAYER', score: 2400, accuracy: 61 },
  { id: '2', name: 'PLAYER', score: 1690, accuracy: 89 },
  { id: '3', name: 'ACE', score: 1550, accuracy: 75 },
  { id: '4', name: 'VIPER', score: 1420, accuracy: 92 },
];

const INITIAL_TARGETS: Target[] = [
  { id: 't1', name: 'Sasti Khusri', status: 'active', imageUrl: 'SastiKhusri.jpg' }, // Use local image
  { id: 't2', name: 'Sana', status: 'active', imageUrl: 'Sana.png' },
  { id: 't3', name: 'Coming Soon', status: 'coming-soon' },
  { id: 't4', name: 'Coming Soon', status: 'coming-soon' },
];

export default function App() {
  const [scores, setScores] = useState<ScoreEntry[]>(INITIAL_SCORES);
  const [callsign, setCallsign] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>('t1');
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS);
  const [gameStarted, setGameStarted] = useState(false);

  const handleClearLeaderboard = () => {
    setScores([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newTarget: Target = {
        id: `custom-${Date.now()}`,
        name: 'Custom Target',
        status: 'active',
        imageUrl
      };
      // Replace the first 'coming soon' slot or add to end if full
      const firstEmptyIndex = targets.findIndex(t => t.status === 'coming-soon');

      let newTargets = [...targets];
      if (firstEmptyIndex !== -1) {
        newTargets[firstEmptyIndex] = newTarget;
      } else {
        newTargets.push(newTarget);
      }
      setTargets(newTargets);
      setSelectedTarget(newTarget.id);
    }
  };

  const handleStartGame = () => {
    if (!callsign) {
      alert("Please enter a callsign!");
      return;
    }

    setGameStarted(true);

    // Find selected target URL
    const target = targets.find(t => t.id === selectedTarget);
    const targetUrl = target?.imageUrl || null;

    // Start the game
    startGame(callsign, targetUrl);
  };

  // Starfield background effect
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'absolute bg-white rounded-full opacity-0 animate-twinkle';
      star.style.width = Math.random() * 2 + 'px';
      star.style.height = star.style.width;
      star.style.top = Math.random() * 100 + '%';
      star.style.left = Math.random() * 100 + '%';
      star.style.animationDuration = Math.random() * 3 + 2 + 's';
      return star;
    };

    const container = document.getElementById('starfield');
    if (container) {
      for (let i = 0; i < 50; i++) {
        container.appendChild(createStar());
      }
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  if (gameStarted) {
    return null; // Hide React UI
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative bg-[#050505]">
      {/* Dynamic Background */}
      <div id="starfield" className="fixed inset-0 pointer-events-none z-0"></div>

      {/* Decorative Grid Lines */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
      <div className="fixed left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Left Panel: Player Setup */}
        <div className="lg:col-span-7 xl:col-span-8">
          <CyberContainer className="h-full min-h-[500px] flex flex-col justify-between">

            {/* Player Name Input Section */}
            <div className="mt-8 mb-12">
              <label className="block text-center text-xs md:text-sm text-gray-400 tracking-[0.3em] mb-4 uppercase font-cyber">
                Player Name
              </label>
              <div className="relative max-w-md mx-auto group">
                {/* Input Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-700 via-white/20 to-gray-700 rounded blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative">
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="ENTER YOUR CALLSIGN"
                    className="w-full bg-black/90 border-2 border-gray-800 text-center py-4 px-6 text-white font-cyber tracking-widest outline-none focus:border-white/50 focus:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all placeholder-gray-600 uppercase rounded-sm"
                  />
                  {/* Decorative bracket lines on input */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 border-l-2 border-t-2 border-b-2 border-gray-600 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 border-r-2 border-t-2 border-b-2 border-gray-600 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Target Selection Section */}
            <div className="flex-grow flex flex-col justify-center">
              <label className="block text-center text-xs md:text-sm text-gray-400 tracking-[0.3em] mb-2 uppercase font-cyber">
                Choose a Target
              </label>

              <TargetSelector
                targets={targets}
                selectedTargetId={selectedTarget}
                onSelect={setSelectedTarget}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-12 mb-4 flex flex-col items-center gap-4">
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
                <label className="relative block cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <div className="bg-gradient-to-b from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white font-cyber uppercase tracking-widest py-4 px-8 border border-gray-600 text-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2">
                    <span className="text-glow">Upload Custom Target</span>
                  </div>
                  {/* Button Glint */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </label>
              </div>

              {/* START GAME BUTTON */}
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-green-300 to-green-500 rounded opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
                <button onClick={handleStartGame} className="relative w-full bg-gradient-to-b from-green-900 to-black hover:from-green-800 hover:to-green-950 text-white font-cyber uppercase tracking-widest py-4 px-8 border border-green-600 text-center shadow-[0_4px_20px_rgba(0,255,0,0.3)] transition-all flex items-center justify-center gap-2">
                  <span className="text-glow-blue">START MISSION</span>
                </button>
                {/* Button Glint */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              </div>
            </div>

          </CyberContainer>
        </div>

        {/* Right Panel: Leaderboard */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <CyberContainer title="Top Scores" className="h-full min-h-[500px]">
            <Leaderboard scores={scores} onClear={handleClearLeaderboard} />
          </CyberContainer>
        </div>

      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation-name: twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}