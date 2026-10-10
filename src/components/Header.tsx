import React from 'react';
import { Target, Mic, GraduationCap, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'questions' | 'simulator' | 'roadmap' | 'history';
  setActiveTab: (tab: 'questions' | 'simulator' | 'roadmap' | 'history') => void;
  onQuickReset: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickReset,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">
              Kariyer & Mülakat Koçu AI
            </span>
            <span className="text-xs text-slate-400 block -mt-0.5">
              Üniversite Mezunları & Profesyoneller İçin
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Unvan Odaklı Sorular</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Canlı STAR Simülasyonu</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Eğitim Analizi & Yol Haritası</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Geçmiş Oturumlar</span>
            {historyCount > 0 && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Yeni Mülakat Oturumu
          </button>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3 py-1.5 rounded-md shrink-0 ${
            activeTab === 'questions' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Soru Üretici
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 rounded-md shrink-0 ${
            activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          STAR Simülatör
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-3 py-1.5 rounded-md shrink-0 ${
            activeTab === 'roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Eğitim Analizi
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-md shrink-0 ${
            activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Geçmiş ({historyCount})
        </button>
      </div>
    </header>
  );
};
