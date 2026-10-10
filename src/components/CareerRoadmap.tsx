import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Briefcase,
  Copy,
  Check,
  Target,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  CareerRoadmapResponse,
  RoadmapHistoryItem,
} from '../types';
import { TRAINING_TEMPLATES, TrainingTemplate } from '../data/presets';

interface CareerRoadmapProps {
  onSaveToHistory: (item: RoadmapHistoryItem) => void;
  cachedRoadmap: CareerRoadmapResponse | null;
  setCachedRoadmap: (roadmap: CareerRoadmapResponse | null) => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({
  onSaveToHistory,
  cachedRoadmap,
  setCachedRoadmap,
}) => {
  const [completedTrainingsText, setCompletedTrainingsText] = useState<string>(
    TRAINING_TEMPLATES[0].content
  );
  const [targetCareerGoal, setTargetCareerGoal] = useState<string>(
    TRAINING_TEMPLATES[0].targetGoal
  );
  const [currentBackground, setCurrentBackground] = useState<string>(
    TRAINING_TEMPLATES[0].background
  );
  const [isNewGraduate, setIsNewGraduate] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRoadmap, setCopiedRoadmap] = useState<boolean>(false);

  const handleApplyTemplate = (tmpl: TrainingTemplate) => {
    setCompletedTrainingsText(tmpl.content);
    setTargetCareerGoal(tmpl.targetGoal);
    setCurrentBackground(tmpl.background);
    setIsNewGraduate(tmpl.isNewGraduate);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!completedTrainingsText.trim()) {
      setError('Lütfen katıldığınız eğitim veya kursların içeriğini giriniz.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTrainingsText,
          targetCareerGoal,
          currentBackground,
          isNewGraduate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Eğitim analizi ve yol haritası çıkarılırken hata oluştu.'
        );
      }

      const data: CareerRoadmapResponse = await response.json();
      setCachedRoadmap(data);

      // Save to history
      const historyItem: RoadmapHistoryItem = {
        id: `road-${Date.now()}`,
        timestamp: new Date().toLocaleString('tr-TR'),
        targetCareerGoal,
        roadmap: data,
      };
      onSaveToHistory(historyItem);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRoadmap = () => {
    if (!cachedRoadmap) return;
    const text = `
# KARİYER VE EĞİTİM YOL HARİTASI
Hedef Rol: ${targetCareerGoal}
Profil: ${currentBackground} ${isNewGraduate ? '(Üniversite Mezunu)' : ''}

## ÖZET
${cachedRoadmap.executiveSummary}

## MEZUNLAR VE İŞ ARAYANLAR İÇİN TAVSİYE
${cachedRoadmap.graduateOrJobSeekerAdvice}

## 1. ÖNCELİKLİ ALINMASI GEREKEN EĞİTİM
Eğitim Başlığı: ${cachedRoadmap.immediateNextTraining.trainingTitle}
Neden Bu Eğitim: ${cachedRoadmap.immediateNextTraining.whyThisFirst}
Tahmini Süre: ${cachedRoadmap.immediateNextTraining.estimatedDuration}
Önerilen Proje: ${cachedRoadmap.immediateNextTraining.projectIdeaToApplyKnowledge}

## BECERİ AÇIKLARI
${cachedRoadmap.skillGaps.map((g) => `- ${g.skillName} (${g.severity}): ${g.impactOnTargetRole}`).join('\n')}

## GELİŞİM AŞAMALARI
${cachedRoadmap.roadmapMilestones.map((m) => `### ${m.phase} (${m.timeline})\nHedef: ${m.objective}\nÇıktı: ${m.expectedDeliverable}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedRoadmap(true);
    setTimeout(() => setCopiedRoadmap(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
            <span>EĞİTİM ANALİZİ & KARİYER MİMARISI</span>
            <span aria-hidden="true">·</span>
            <span>BECERİ AÇIĞI (SKILL GAP) & YOL HARİTASI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Eğitimlerini Analiz Et, Sonraki Adımı Keşfet
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Katıldığınız üniversite derslerini, online kursları, sertifikaları ve projeleri girin.
            Yapay zeka hedef rolünüze göre mevcut yetkinliklerinizi ve kritik eksiklerinizi (skill gaps) çıkarsın;
            tam olarak <strong>bir sonraki adımda nasıl bir eğitim almanız gerektiğini</strong> adım adım planlasın.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-6 space-y-5">
          {/* Preset Buttons for Quick Exploration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">
                Örnek Şablonlar ile Hemen Dene (Üniversite Mezunları & Profesyoneller):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TRAINING_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 rounded-lg border bg-slate-950/70 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-left transition-all"
                >
                  <span className="block text-[11px] font-bold text-indigo-300">
                    {tmpl.badge}
                  </span>
                  <span className="block text-xs font-medium text-slate-200 truncate mt-0.5">
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Background */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mevcut Arka Plan / Okul / Bölüm
              </label>
              <input
                type="text"
                value={currentBackground}
                onChange={(e) => setCurrentBackground(e.target.value)}
                placeholder="Örn: Bilgisayar Müh. Yeni Mezun, Endüstri Müh."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hedef Pozisyon / Kariyer Basamağı *
              </label>
              <input
                type="text"
                value={targetCareerGoal}
                onChange={(e) => setTargetCareerGoal(e.target.value)}
                placeholder="Örn: Junior Backend Developer, Data Scientist"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* New Graduate Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mezuniyet Durumu
              </label>
              <div
                onClick={() => setIsNewGraduate(!isNewGraduate)}
                className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 select-none"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isNewGraduate
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {isNewGraduate && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs text-slate-200 font-medium">
                  🎓 Üniversite Mezunuyum / Yeni Mezun
                </span>
              </div>
            </div>
          </div>

          {/* Trainings Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Katıldığınız / Tamamladığınız Eğitimler, Dersler, Kurslar ve İçerikleri *
            </label>
            <textarea
              rows={6}
              value={completedTrainingsText}
              onChange={(e) => setCompletedTrainingsText(e.target.value)}
              placeholder="Örn: 
1. Üniversitede aldığım dersler: Veri Yapıları, Algoritmalar, SQL Veritabanı...
2. Udemy / Coursera Kursu: Python for Data Science (30 saat, Pandas, NumPy)...
3. Tamamlanan Sertifika veya Atölyeler..."
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              * Beceri açığı matrisi, öncelikli eğitim adımı ve 3 aşamalı somut yol haritası üretir.
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Eğitim Geçmişiniz Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Eğitimleri Analiz Et & Gelecek Yol Haritasını Çıkar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {cachedRoadmap && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Kariyer Gelişim Stratejisi: {targetCareerGoal}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Mevcut Profil: {currentBackground}</span>
                    <span aria-hidden="true">·</span>
                    <span>{isNewGraduate ? 'Üniversite Mezunu' : 'Profesyonel'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRoadmap}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedRoadmap ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Yol Haritasını Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              {cachedRoadmap.executiveSummary}
            </p>

            {/* Graduate Specific Mentor Advice */}
            <div className="bg-indigo-950/30 border border-indigo-900/60 p-4 rounded-lg flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-300 block mb-1">
                  Üniversite Mezunları & İş Arayanlar İçin Altın Kural:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cachedRoadmap.graduateOrJobSeekerAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Core Focus: The #1 Immediate Next Training */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border-2 border-indigo-500/40 rounded-xl p-6 sm:p-7 space-y-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>1 NUMARALI ÖNCELİKLE ALINMASI GEREKEN EĞİTİM</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/80">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tahmini Süre: {cachedRoadmap.immediateNextTraining.estimatedDuration}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {cachedRoadmap.immediateNextTraining.trainingTitle}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 mt-2 leading-relaxed">
                <strong className="text-white font-semibold">Neden İlk Bu Eğitimi Almalısınız? </strong>
                {cachedRoadmap.immediateNextTraining.whyThisFirst}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-indigo-900/40">
              {/* Syllabus */}
              <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg space-y-2">
                <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                  Öğrenilmesi Gereken Temel Başlıklar (Müfredat)
                </span>
                <ul className="space-y-1.5">
                  {cachedRoadmap.immediateNextTraining.keyTopicsToMaster.map((topic, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">›</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certifications & Practical Project */}
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                    Tavsiye Edilen Platform & Sertifikalar
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cachedRoadmap.immediateNextTraining.suggestedPlatformsOrCertifications.map(
                      (plat, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded"
                        >
                          {plat}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg space-y-1">
                  <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                    Eğitimi İspatlayacak Portfolyo Projesi Fikri
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cachedRoadmap.immediateNextTraining.projectIdeaToApplyKnowledge}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acquired Skills vs. Skill Gaps Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acquired Skills */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mevcut Eğitimlerle Kazanılmış Güçlü Beceriler
                </h4>
              </div>
              <ul className="space-y-2">
                {cachedRoadmap.acquiredSkills.map((skill, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Gaps */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Kritik Beceri Açıkları (Skill Gap Matrix)
                </h4>
              </div>
              <div className="space-y-2.5">
                {cachedRoadmap.skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{gap.skillName}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          gap.severity === 'Kritik'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : gap.severity === 'Yüksek'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {gap.severity} Öncelik
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {gap.impactOnTargetRole}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Recommended Trainings */}
          {cachedRoadmap.secondaryRecommendedTrainings &&
            cachedRoadmap.secondaryRecommendedTrainings.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Gelecek Aşamalar İçin Tamamlayıcı Eğitim Önerileri
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cachedRoadmap.secondaryRecommendedTrainings.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 p-4 rounded-lg space-y-2"
                    >
                      <span className="text-[10px] font-mono text-indigo-400 block uppercase">
                        {item.category}
                      </span>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.importanceReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 3-Step Milestone Roadmap */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h4 className="text-base font-bold text-white">
                Kişiselleştirilmiş 3 Aşamalı Kariyer Gelişim Yol Haritası
              </h4>
            </div>

            <div className="space-y-6">
              {cachedRoadmap.roadmapMilestones.map((m, idx) => (
                <div
                  key={idx}
                  className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/40 space-y-2"
                >
                  {/* Step Marker */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-950" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-extrabold text-white text-sm">
                      {m.phase}
                    </span>
                    <span className="text-indigo-400 font-mono font-medium">
                      {m.timeline}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Hedef: </strong>
                    {m.objective}
                  </p>

                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Somut Aksiyon Maddeleri:
                    </span>
                    <ul className="space-y-1">
                      {m.actionItems.map((act, actIdx) => (
                        <li key={actIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-slate-800/80 text-xs text-emerald-400 flex items-start gap-1.5">
                      <span className="font-semibold text-slate-300 shrink-0">
                        Beklenen Çıktı / Milstone:
                      </span>
                      <span>{m.expectedDeliverable}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
