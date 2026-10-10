import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InterviewGenerator } from './components/InterviewGenerator';
import { StarSimulator } from './components/StarSimulator';
import { CareerRoadmap } from './components/CareerRoadmap';
import { HistoryExportModal } from './components/HistoryExportModal';
import {
  GeneratedQuestionsResponse,
  InterviewQuestion,
  SimulationHistoryItem,
  RoadmapHistoryItem,
  CareerRoadmapResponse,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'questions' | 'simulator' | 'roadmap' | 'history'>(
    'questions'
  );

  // Cached state for Question Generator
  const [cachedQuestions, setCachedQuestions] = useState<GeneratedQuestionsResponse | null>(null);

  // Active question being simulated
  const [activeSimQuestion, setActiveSimQuestion] = useState<InterviewQuestion | null>(null);
  const [simInterviewer, setSimInterviewer] = useState<string>('Üniversite & Kampüs İşe Alım Uzmanı');
  const [simRole, setSimRole] = useState<string>('Junior Yazılım Mühendisi');
  const [simLevel, setSimLevel] = useState<string>('Üniversite Mezunu / Yeni Mezun');

  // Cached state for Career Roadmap
  const [cachedRoadmap, setCachedRoadmap] = useState<CareerRoadmapResponse | null>(null);

  // Persistent History
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('career_coach_sim_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [roadmapHistory, setRoadmapHistory] = useState<RoadmapHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('career_coach_roadmap_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('career_coach_sim_history', JSON.stringify(simulationHistory));
    } catch (e) {
      console.warn('Failed to save sim history:', e);
    }
  }, [simulationHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('career_coach_roadmap_history', JSON.stringify(roadmapHistory));
    } catch (e) {
      console.warn('Failed to save roadmap history:', e);
    }
  }, [roadmapHistory]);

  const handleSelectQuestionForSimulation = (
    question: InterviewQuestion,
    interviewerTitle: string,
    targetRole: string,
    experienceLevel: string
  ) => {
    setActiveSimQuestion(question);
    setSimInterviewer(interviewerTitle);
    setSimRole(targetRole);
    setSimLevel(experienceLevel);
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSimulation = (item: SimulationHistoryItem) => {
    setSimulationHistory((prev) => [item, ...prev]);
  };

  const handleSaveRoadmap = (item: RoadmapHistoryItem) => {
    setRoadmapHistory((prev) => [item, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Tüm simülasyon ve yol haritası geçmişini silmek istediğinize emin misiniz?')) {
      setSimulationHistory([]);
      setRoadmapHistory([]);
      localStorage.removeItem('career_coach_sim_history');
      localStorage.removeItem('career_coach_roadmap_history');
    }
  };

  const handleQuickReset = () => {
    setActiveSimQuestion(null);
    setActiveTab('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalHistoryCount = simulationHistory.length + roadmapHistory.length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickReset={handleQuickReset}
        historyCount={totalHistoryCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'questions' && (
          <InterviewGenerator
            onSelectQuestionForSimulation={handleSelectQuestionForSimulation}
            cachedResult={cachedQuestions}
            setCachedResult={setCachedQuestions}
          />
        )}

        {activeTab === 'simulator' && (
          <StarSimulator
            initialQuestion={activeSimQuestion}
            interviewerTitle={simInterviewer}
            targetRole={simRole}
            experienceLevel={simLevel}
            onSaveToHistory={handleSaveSimulation}
          />
        )}

        {activeTab === 'roadmap' && (
          <CareerRoadmap
            onSaveToHistory={handleSaveRoadmap}
            cachedRoadmap={cachedRoadmap}
            setCachedRoadmap={setCachedRoadmap}
          />
        )}

        {activeTab === 'history' && (
          <HistoryExportModal
            simulationHistory={simulationHistory}
            roadmapHistory={roadmapHistory}
            onClearHistory={handleClearHistory}
            onSelectSimulation={(item) => {
              setActiveSimQuestion({
                id: item.id,
                category: 'Geçmiş Soru',
                difficulty: 'Orta',
                questionText: item.questionText,
                whatTheyLookFor: '',
                starGuide: { situation: '', task: '', action: '', result: '' },
                recommendedKeywords: [],
              });
              setSimInterviewer(item.interviewerTitle);
              setActiveTab('simulator');
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Kariyer & Mülakat Koçu AI</span>
            <span aria-hidden="true">·</span>
            <span>Üniversite Mezunları & Profesyoneller İçin STAR Mülakat Simülatörü</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Google Gemini 3.8 Flash Destekli</span>
            <span aria-hidden="true">·</span>
            <span>Web Speech API Entegreli</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
