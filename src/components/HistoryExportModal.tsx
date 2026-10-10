import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
} from 'lucide-react';
import { SimulationHistoryItem, RoadmapHistoryItem } from '../types';

interface HistoryExportModalProps {
  simulationHistory: SimulationHistoryItem[];
  roadmapHistory: RoadmapHistoryItem[];
  onClearHistory: () => void;
  onSelectSimulation: (item: SimulationHistoryItem) => void;
}

export const HistoryExportModal: React.FC<HistoryExportModalProps> = ({
  simulationHistory,
  roadmapHistory,
  onClearHistory,
  onSelectSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<'simulations' | 'roadmaps'>('simulations');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAllAsMarkdown = () => {
    let md = `# KARİYER VE MÜLAKAT KOÇU - OTURUM KAYITLARI\nTarih: ${new Date().toLocaleString('tr-TR')}\n\n`;

    md += `## 1. MÜLAKAT VE STAR SİMÜLASYONLARI (${simulationHistory.length})\n\n`;
    simulationHistory.forEach((item, idx) => {
      md += `### ${idx + 1}. Görüşmeci: ${item.interviewerTitle} (${item.timestamp})\n`;
      md += `**Soru:** ${item.questionText}\n\n`;
      md += `**Aday Cevabı:** ${item.userAnswer}\n\n`;
      md += `**Toplam Puan:** ${item.evaluation.scores.totalScore}/100 (Durum: ${item.evaluation.scores.situationScore}, Görev: ${item.evaluation.scores.taskScore}, Eylem: ${item.evaluation.scores.actionScore}, Sonuç: ${item.evaluation.scores.resultScore})\n\n`;
      md += `**Örnek Yeniden Yazım:** ${item.evaluation.exemplaryAnswer}\n\n`;
      md += `**Karşı Atak Sorusu:** ${item.evaluation.counterQuestion.questionText}\n\n---\n\n`;
    });

    md += `## 2. EĞİTİM VE KARİYER YOL HARİTALARI (${roadmapHistory.length})\n\n`;
    roadmapHistory.forEach((r, idx) => {
      md += `### ${idx + 1}. Hedef: ${r.targetCareerGoal} (${r.timestamp})\n`;
      md += `**Özet:** ${r.roadmap.executiveSummary}\n\n`;
      md += `**1. Öncelikli Eğitim:** ${r.roadmap.immediateNextTraining.trainingTitle}\n`;
      md += `**Neden İlk:** ${r.roadmap.immediateNextTraining.whyThisFirst}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kariyer-kocu-raporu-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <span>OTURUM ARŞİVİ</span>
              <span aria-hidden="true">·</span>
              <span>YEREL KAYITLAR (LOCAL STORAGE)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Geçmiş Oturumlar & Kayıtlar</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Daha önce gerçekleştirdiğiniz STAR mülakat simülasyonları ve eğitim yol haritaları.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAllAsMarkdown}
              disabled={simulationHistory.length === 0 && roadmapHistory.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tüm Raporu İndir (.md)</span>
            </button>

            <button
              onClick={onClearHistory}
              disabled={simulationHistory.length === 0 && roadmapHistory.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Geçmişi Temizle</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-6 p-1 bg-slate-950 rounded-lg border border-slate-800 w-fit text-xs">
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'simulations'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mülakat Simülasyonları ({simulationHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'roadmaps'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Eğitim Yol Haritaları ({roadmapHistory.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'simulations' && (
        <div className="space-y-4">
          {simulationHistory.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs sm:text-sm">
              Henüz tamamlanmış bir mülakat simülasyonu bulunmuyor.
              <br />
              "Canlı STAR Simülasyonu" sekmesinden ilk pratiğinizi yapabilirsiniz.
            </div>
          ) : (
            simulationHistory.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.timestamp}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-400 font-semibold">{item.interviewerTitle}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {item.questionText}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-xs">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-white">
                          {item.evaluation.scores.totalScore}/100
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary answer preview */}
                  <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <span className="font-semibold text-slate-400 block mb-1">Verdiğiniz Yanıt:</span>
                    <p className="line-clamp-2">{item.userAnswer}</p>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                          <span className="text-slate-400 text-[10px] block">Durum (S)</span>
                          <span className="text-indigo-400 font-bold">{item.evaluation.scores.situationScore}/25</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                          <span className="text-slate-400 text-[10px] block">Görev (T)</span>
                          <span className="text-indigo-400 font-bold">{item.evaluation.scores.taskScore}/25</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                          <span className="text-slate-400 text-[10px] block">Eylem (A)</span>
                          <span className="text-indigo-400 font-bold">{item.evaluation.scores.actionScore}/25</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                          <span className="text-slate-400 text-[10px] block">Sonuç (R)</span>
                          <span className="text-emerald-400 font-bold">{item.evaluation.scores.resultScore}/25</span>
                        </div>
                      </div>

                      <div className="bg-indigo-950/20 border border-indigo-900/50 p-3.5 rounded-lg space-y-1">
                        <span className="font-bold text-indigo-300 block">Örnek Model Yanıt:</span>
                        <p className="text-slate-200 leading-relaxed">{item.evaluation.exemplaryAnswer}</p>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                        <span className="font-bold text-rose-400 block">Karşı Atak Sorusu:</span>
                        <p className="text-slate-200">"{item.evaluation.counterQuestion.questionText}"</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'roadmaps' && (
        <div className="space-y-4">
          {roadmapHistory.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs sm:text-sm">
              Henüz kaydedilmiş bir eğitim yol haritası bulunmuyor.
              <br />
              "Eğitim Analizi & Yol Haritası" sekmesinden analiz gerçekleştirebilirsiniz.
            </div>
          ) : (
            roadmapHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.timestamp}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Hedef Rol: {item.targetCareerGoal}
                    </h3>
                  </div>

                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-2.5 py-1 rounded font-medium">
                    1. Eğitim: {item.roadmap.immediateNextTraining.trainingTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {item.roadmap.executiveSummary}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
