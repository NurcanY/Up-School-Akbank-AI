import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  HelpCircle,
  Play,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  GeneratedQuestionsResponse,
  InterviewQuestion,
  InterviewerPersona,
} from '../types';
import { INTERVIEWER_TITLE_PRESETS } from '../data/presets';
import { playTextToSpeech, stopCurrentAudio } from '../utils/audio';

interface InterviewGeneratorProps {
  onSelectQuestionForSimulation: (
    question: InterviewQuestion,
    interviewerTitle: string,
    targetRole: string,
    experienceLevel: string
  ) => void;
  cachedResult: GeneratedQuestionsResponse | null;
  setCachedResult: (result: GeneratedQuestionsResponse | null) => void;
}

export const InterviewGenerator: React.FC<InterviewGeneratorProps> = ({
  onSelectQuestionForSimulation,
  cachedResult,
  setCachedResult,
}) => {
  const [interviewerTitle, setInterviewerTitle] = useState('Üniversite & Kampüs İşe Alım Uzmanı');
  const [targetRole, setTargetRole] = useState('Junior Yazılım Mühendisi');
  const [experienceLevel, setExperienceLevel] = useState('Üniversite Mezunu / Yeni Mezun');
  const [industry, setIndustry] = useState('Teknoloji & Yazılım');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handleTogglePlay = async (text: string, id: string) => {
    if (playingAudioId === id) {
      stopCurrentAudio();
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(id);
    await playTextToSpeech(
      text,
      () => setPlayingAudioId(id),
      () => setPlayingAudioId(null)
    );
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewerTitle.trim()) {
      setError('Lütfen görüşmeci unvanını giriniz.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          experienceLevel,
          industry,
          specialNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Sorular üretilirken bir sorun oluştu.');
      }

      const data: GeneratedQuestionsResponse = await response.json();
      setCachedResult(data);
      if (data.questions.length > 0) {
        setExpandedQuestionId(data.questions[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: (typeof INTERVIEWER_TITLE_PRESETS)[0]) => {
    setInterviewerTitle(preset.title);
    setTargetRole(preset.defaultRole);
    setExperienceLevel(preset.defaultLevel);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = cachedResult
    ? ['Hepsi', ...Array.from(new Set(cachedResult.questions.map((q) => q.category)))]
    : [];

  const filteredQuestions = cachedResult
    ? selectedCategory === 'Hepsi'
      ? cachedResult.questions
      : cachedResult.questions.filter((q) => q.category === selectedCategory)
    : [];

  return (
    <div className="space-y-8">
      {/* Hero & Intro */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
            <span>MÜLAKAT SORU LABORATUVARI</span>
            <span aria-hidden="true">·</span>
            <span>GÖRÜŞMECİ PERSPEKTİFİ ANALİZİ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Mülakatçının Unvanına Özel Stratejik Sorular Üret
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Karşınıza oturacak kişinin unvanını (örn. İK Lideri, Teknik Müdür, Departman Direktörü) girin.
            Yapay zeka o pozisyonun beklenti haritasını çıkarsın ve adayı sınamak için soracağı potansiyel soruları STAR rehberiyle birlikte hazırlasın.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-2">
              Hızlı Rol Seçimi (Üniversite Mezunları & Profesyoneller):
            </span>
            <div className="flex flex-wrap gap-2">
              {INTERVIEWER_TITLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                    interviewerTitle === p.title
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Field 1: Interviewer Title */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mülakatı Yapacak Kişinin Unvanı *
              </label>
              <input
                type="text"
                value={interviewerTitle}
                onChange={(e) => setInterviewerTitle(e.target.value)}
                placeholder="Örn: Engineering Manager, İK Uzmanı, Head of Product"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Field 2: Target Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Başvurulan Hedef Rol
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Örn: Junior Frontend Developer"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Field 3: Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Deneyim Seviyesi
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="Üniversite Mezunu / Yeni Mezun">🎓 Üniversite Mezunu / Yeni Mezun</option>
                <option value="Junior (0-2 Yıl)">Junior (0 - 2 Yıl)</option>
                <option value="Mid-Level (2-5 Yıl)">Mid-Level (2 - 5 Yıl)</option>
                <option value="Senior (5+ Yıl)">Senior (5+ Yıl)</option>
                <option value="Lead / Yönetici">Lead / Yönetici</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sektör / Çalışma Alanı
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Örn: Teknoloji & SaaS, Fintech, Bankacılık, Perakende"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Özel Notlar veya Şirket Ayrıntısı (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Örn: Şirket hızlı büyüyen bir startup, mikroservis mimarisi kullanıyor"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              * Gemini 3.8 Flash modeliyle görüşmeci psikolojisine ve STAR metodolojisine göre üretilir.
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mülakatçı Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Soruları ve Görüşmeci Profilini Üret</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {cachedResult && (
        <div className="space-y-6">
          {/* Persona Insight Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Görüşmeci Profili: {cachedResult.interviewerPersona.interviewerTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Hedef: {targetRole}</span>
                    <span aria-hidden="true">·</span>
                    <span>{experienceLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800/80">
              {/* Mindset & Focus */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Zihin Yapısı & Temel Beklenti
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {cachedResult.interviewerPersona.mindset}
                </p>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Adayda Aradığı Öncelikli Nitelikler:
                  </span>
                  <ul className="space-y-1">
                    {cachedResult.interviewerPersona.corePriorities.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Traps */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Düşülebilecek Tuzaklar</span>
                </span>
                <ul className="space-y-2">
                  {cachedResult.interviewerPersona.potentialTraps.map((trap, idx) => (
                    <li key={idx} className="text-xs text-slate-300 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg leading-relaxed">
                      {trap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coach Tip */}
              <div className="space-y-2 bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-4">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Baş Koçun Altın Tavsiyesi</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {cachedResult.interviewerPersona.coachingTip}
                </p>
              </div>
            </div>
          </div>

          {/* Question Filter Tabs & Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Üretilen Mülakat Soruları ({filteredQuestions.length} Soru)
              </h2>
            </div>

            {/* Category Segmented Control */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, index) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id || index}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all overflow-hidden"
                >
                  <div className="p-5">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-indigo-400">0{index + 1}.</span>
                          <span>{q.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-300">Zorluk: {q.difficulty}</span>
                        </div>
                        <h3 className="text-base font-bold text-white leading-snug">
                          {q.questionText}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyToClipboard(q.questionText, q.id)}
                          title="Soruyu Kopyala"
                          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {copiedId === q.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePlay(q.questionText, q.id)}
                          title={playingAudioId === q.id ? "Seslendirmeyi Durdur" : "Soruyu Sesli Dinle"}
                          className={`p-2 rounded-lg transition-colors ${
                            playingAudioId === q.id
                              ? 'bg-indigo-600 text-white animate-pulse'
                              : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
                          }`}
                        >
                          {playingAudioId === q.id ? (
                            <VolumeX className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            onSelectQuestionForSimulation(
                              q,
                              interviewerTitle,
                              targetRole,
                              experienceLevel
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Simüle Et</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedQuestionId(isExpanded ? null : q.id)
                          }
                          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* What they look for */}
                    <div className="mt-3 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                      <span className="font-semibold text-indigo-300 block mb-0.5">
                        Mülakatçı Bu Soruyla Neyi Sınıyor?
                      </span>
                      <span>{q.whatTheyLookFor}</span>
                    </div>

                    {/* Collapsible STAR Guide & Keywords */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block mb-2 uppercase tracking-wider">
                            Bu Soru İçin STAR Yanıt Stratejisi
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                              <span className="text-[11px] font-bold text-indigo-400 block mb-1">
                                [S] Durum (Situation):
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {q.starGuide.situation}
                              </p>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                              <span className="text-[11px] font-bold text-indigo-400 block mb-1">
                                [T] Görev (Task):
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {q.starGuide.task}
                              </p>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                              <span className="text-[11px] font-bold text-indigo-400 block mb-1">
                                [A] Eylem (Action):
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {q.starGuide.action}
                              </p>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                              <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                                [R] Sonuç (Result):
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {q.starGuide.result}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recommended Keywords */}
                        {q.recommendedKeywords && q.recommendedKeywords.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                            <span className="font-semibold text-slate-300">Önerilen Anahtar Kelimeler:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {q.recommendedKeywords.map((kw, kwIdx) => (
                                <span
                                  key={kwIdx}
                                  className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
