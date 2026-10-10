import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import {
  InterviewQuestion,
  StarEvaluationResponse,
  SimulationHistoryItem,
} from '../types';
import { playTextToSpeech, stopCurrentAudio, blobToBase64 } from '../utils/audio';

interface StarSimulatorProps {
  initialQuestion?: InterviewQuestion | null;
  interviewerTitle?: string;
  targetRole?: string;
  experienceLevel?: string;
  onSaveToHistory: (item: SimulationHistoryItem) => void;
}

export const StarSimulator: React.FC<StarSimulatorProps> = ({
  initialQuestion,
  interviewerTitle = 'Üniversite & Kampüs İşe Alım Uzmanı',
  targetRole = 'Junior Yazılım Mühendisi',
  experienceLevel = 'Üniversite Mezunu / Yeni Mezun',
  onSaveToHistory,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    initialQuestion?.questionText ||
      'Bize üniversitede veya bir projede karşılaştığın en zorlu teknik problemi ve bunu nasıl aştığını anlatır mısın?'
  );
  const [interviewer, setInterviewer] = useState<string>(interviewerTitle);
  const [role, setRole] = useState<string>(targetRole);
  const [level, setLevel] = useState<string>(experienceLevel);
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Audio TTS playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Simulation Evaluation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<StarEvaluationResponse | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Update if initialQuestion changes
  useEffect(() => {
    if (initialQuestion?.questionText) {
      setCurrentQuestion(initialQuestion.questionText);
    }
    if (interviewerTitle) setInterviewer(interviewerTitle);
    if (targetRole) setRole(targetRole);
    if (experienceLevel) setLevel(experienceLevel);
  }, [initialQuestion, interviewerTitle, targetRole, experienceLevel]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handle Play TTS for any text
  const handleTogglePlayAudio = async (text: string, id: string) => {
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

  // Start / Stop Microphone Recording (MediaRecorder + Gemini 3.5 Transcribe)
  const toggleRecording = async () => {
    setSpeechError(null);

    // If currently recording, STOP it
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsRecording(false);
      return;
    }

    // START recording
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tarayıcınız mikrofon erişimini desteklemiyor. Lütfen yanıtınızı yazarak girin.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) {
          return; // Too short
        }

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const response = await fetch('/api/audio/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Ses transkripsiyonu tamamlanamadı.');
          }

          const data = await response.json();
          if (data.text) {
            setUserAnswer((prev) => (prev ? prev + ' ' : '') + data.text.trim());
          }
        } catch (err: any) {
          console.warn('Transcribe error:', err);
          setSpeechError(`Ses aktarımı uyarısı: ${err?.message || 'Lütfen tekrar deneyin veya yazarak girin.'}`);
        } finally {
          setIsTranscribing(false);
        }
      };

      // Also try live Web Speech recognition if supported for instant interim preview
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'tr-TR';
          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
              }
            }
            if (finalTranscript) {
              setUserAnswer((prev) => (prev ? prev + ' ' : '') + finalTranscript.trim());
            }
          };
          recognition.start();
          recognitionRef.current = recognition;
        }
      } catch (e) {
        // Ignore fallback error, mediaRecorder is primary
      }

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setIsRecording(false);
      setSpeechError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Mikrofon izni verilmedi. Tarayıcı ayarlarından mikrofon iznini etkinleştirin veya yanıtınızı yazarak girin.'
          : `Mikrofon başlatılamadı: ${err.message || 'Lütfen mikrofon bağlantısını kontrol edin.'}`
      );
    }
  };

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) {
      setError('Lütfen önce sorulan soruya yanıtınızı sesli veya yazılı olarak giriniz.');
      return;
    }

    if (isRecording) {
      toggleRecording();
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interview/evaluate-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle: interviewer,
          targetRole: role,
          experienceLevel: level,
          questionText: currentQuestion,
          userAnswer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'STAR analizi yapılırken hata oluştu.');
      }

      const data: StarEvaluationResponse = await response.json();
      setEvaluation(data);

      // Save to history
      const historyItem: SimulationHistoryItem = {
        id: `sim-${Date.now()}`,
        timestamp: new Date().toLocaleString('tr-TR'),
        interviewerTitle: interviewer,
        questionText: currentQuestion,
        userAnswer,
        evaluation: data,
      };
      onSaveToHistory(historyItem);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleAnswer = (type: 'weak' | 'strong') => {
    if (type === 'weak') {
      setUserAnswer(
        'Üniversitede bitirme projemizde web sitesi yapıyorduk. Kod çalışmıyordu ve teslim tarihi yaklaşıyordu. Çok stres olduk ama arkadaşlarla sabaha kadar oturup hallettik ve hocaya sunduk, fena olmadı.'
      );
    } else {
      setUserAnswer(
        'Üniversite 4. sınıf bitirme projemizde 4 kişilik bir ekiple gerçek zamanlı bir kütüphane yönetim sistemi geliştiriyorduk (Situation). Benim görevim veritabanı mimarisini kurmak ve eşzamanlı rezervasyonlarda oluşan çakışmaları çözmekti (Task). SQL transaction izolasyon seviyelerini yeniden yapılandırdım ve NodeJS üzerinde Redis tabanlı bir kilit mekanizması tasarlayarak test senaryolarını çalıştırdım (Action). Sonuç olarak sistemdeki çakışma oranını %0\'a indirdik ve proje tesliminde 100 üzerinden 95 puan alarak bölüm birincisi olduk (Result).'
      );
    }
  };

  const handleSimulateCounterQuestion = () => {
    if (!evaluation?.counterQuestion) return;
    setCurrentQuestion(evaluation.counterQuestion.questionText);
    setUserAnswer('');
    setEvaluation(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyExemplary = () => {
    if (!evaluation?.exemplaryAnswer) return;
    navigator.clipboard.writeText(evaluation.exemplaryAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Simulation Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <span>CANLI MÜLAKAT SİMÜLATÖRÜ</span>
              <span aria-hidden="true">·</span>
              <span>SESLİ & YAZILI STAR MOTORU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Görüşmeci Karşısında Canlı Pratik Yap
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Soruyu dinleyin veya okuyun, mikrofonla konuşarak ya da yazarak yanıtlayın.
              Yapay zeka koçunuz cevabınızı STAR metodolojisiyle puanlayıp görüşmecinin zorlayıcı takip sorusunu çıkarsın.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold">
              AI
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Karşınızdaki Görüşmeci:</span>
              <span className="text-white font-semibold block">{interviewer}</span>
            </div>
          </div>
        </div>

        {/* Question & Audio Playback Box */}
        <div className="mt-6 space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Mülakat Sorusu
              </span>

              {/* Speaker Audio Playback Button */}
              <button
                type="button"
                onClick={() => handleTogglePlayAudio(currentQuestion, 'current-question')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  playingAudioId === 'current-question'
                    ? 'bg-indigo-600 text-white animate-pulse shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800'
                }`}
              >
                {playingAudioId === 'current-question' ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Durdur</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Soruyu Sesli Dinle</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              className="w-full bg-transparent border-0 text-sm sm:text-base text-white focus:outline-none focus:ring-0 font-semibold resize-none"
            />
          </div>

          {/* User Answer Area with Speech Recording & Text */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Yanıtınız:</span>
                {isRecording && (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-mono font-bold animate-pulse text-xs bg-rose-950/60 border border-rose-900/60 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Kayıt Alınıyor: {formatTimer(recordingSeconds)}
                  </span>
                )}
                {isTranscribing && (
                  <span className="inline-flex items-center gap-1.5 text-indigo-400 font-semibold text-xs animate-pulse">
                    <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Ses Metne Dönüştürülüyor...
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Hızlı Örnek:</span>
                <button
                  type="button"
                  onClick={() => loadSampleAnswer('weak')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded transition-colors"
                >
                  Zayıf Yanıt
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleAnswer('strong')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded transition-colors"
                >
                  Güçlü STAR
                </button>
              </div>
            </div>

            {/* Input Container */}
            <div className="relative">
              <textarea
                rows={7}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Örn: 'Üniversitede bitirme projemde şu durumla karşılaştık (S)... Benim görevim şuydu (T)... Bireysel olarak şu eylemleri gerçekleştirdim (A)... Ve sonucunda şu çıktıyı elde ettik (R)...'"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed font-sans"
              />

              {/* Floating Mic Button inside textarea */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Kaydı Bitir & Aktar ({formatTimer(recordingSeconds)})</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Mikrofonla Konuş (Sesli Yanıtla)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {speechError && (
              <div className="mt-2.5 p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              STAR Modeli: Situation (Durum), Task (Görev), Action (Eylem), Result (Ölçülebilir Sonuç)
            </span>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isLoading || !userAnswer.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>STAR Analizi ve Karşı Atak Üretiliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Cevabımı STAR Modeliyle Değerlendir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Result View */}
      {evaluation && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Overall Score Gauge */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-mono ${
                    evaluation.scores.totalScore >= 80
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                      : evaluation.scores.totalScore >= 60
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                  }`}
                >
                  <span className="text-2xl font-black tabular-nums">
                    {evaluation.scores.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">/ 100 PUAN</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">
                      Mülakat Performans Değerlendirmesi
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {evaluation.scores.totalScore >= 80
                      ? 'Harika! Cevabınız STAR metodolojisine yüksek düzeyde uyuyor ve ölçülebilir değer sunuyor.'
                      : evaluation.scores.totalScore >= 60
                      ? 'İyi bir temel var; ancak eylem veya sonuç kısımlarında daha spesifik veri vermelisiniz.'
                      : 'Cevabınız hikaye anlatımından ziyade somut STAR yapısına ve bireysel eylemlere kavuşturulmalı.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 STAR Components Progress Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              {/* Situation */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">[S] Durum (Situation)</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {evaluation.scores.situationScore}/25
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(evaluation.scores.situationScore / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {evaluation.starAnalysis.situationAnalysis}
                </p>
              </div>

              {/* Task */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">[T] Görev (Task)</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {evaluation.scores.taskScore}/25
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(evaluation.scores.taskScore / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {evaluation.starAnalysis.taskAnalysis}
                </p>
              </div>

              {/* Action */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">[A] Eylem (Action)</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {evaluation.scores.actionScore}/25
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(evaluation.scores.actionScore / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {evaluation.starAnalysis.actionAnalysis}
                </p>
              </div>

              {/* Result */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">[R] Sonuç (Result)</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {evaluation.scores.resultScore}/25
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(evaluation.scores.resultScore / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {evaluation.starAnalysis.resultAnalysis}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Critical Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cevabınızdaki Güçlü Yönler</span>
              </span>
              <ul className="space-y-2">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for improvement */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Geliştirilmesi Gereken Noktalar</span>
              </span>
              <ul className="space-y-2">
                {evaluation.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exemplary Answer Rewrite */}
          <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Koçun Yeniden Yazımı: Örnek Mükemmel STAR Yanıtı</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePlayAudio(evaluation.exemplaryAnswer, 'exemplary')}
                  className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
                    playingAudioId === 'exemplary'
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{playingAudioId === 'exemplary' ? 'Durdur' : 'Sesli Dinle'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyExemplary}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 transition-colors"
                >
                  {copiedAnswer ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              {evaluation.exemplaryAnswer}
            </p>
          </div>

          {/* Counter-Attack Simulation (Follow-up Question) */}
          <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  MÜLAKATÇININ KARŞI ATAK TAKİP SORUSU (COUNTER-ATTACK)
                </span>
                <span className="text-xs text-slate-400 block">
                  Mülakatçı Tavrı: <strong className="text-slate-200">{evaluation.counterQuestion.interviewerTone}</strong>
                </span>
              </div>

              {/* Speaker button for counter question */}
              <button
                type="button"
                onClick={() =>
                  handleTogglePlayAudio(
                    evaluation.counterQuestion.questionText,
                    'counter-question'
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  playingAudioId === 'counter-question'
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-slate-950 text-indigo-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {playingAudioId === 'counter-question' ? 'Durdur' : 'Soruyu Sesli Oku'}
                </span>
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                "{evaluation.counterQuestion.questionText}"
              </h4>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-indigo-300 flex items-start gap-2">
                <span className="font-semibold text-indigo-400 shrink-0">Koç Stratejisi:</span>
                <span>{evaluation.counterQuestion.strategyTip}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSimulateCounterQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <span>Bu Karşı Atak Sorusunu Yanıtla & Simülasyona Devam Et</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
