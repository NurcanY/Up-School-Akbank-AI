import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-Side Gemini Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for cleaning markdown fence from JSON if needed
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// 1. Endpoint: Generate Tailored Interview Questions based on Interviewer Title
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      experienceLevel,
      industry,
      specialNotes,
    } = req.body;

    if (!interviewerTitle) {
      return res.status(400).json({ error: 'Görüşmeci unvanı zorunludur.' });
    }

    const prompt = `
Sen kıdemli bir Kariyer ve Mülakat Baş Koçusun (Senior Executive Interview Career Coach).
Aday şu pozisyon için mülakata girecektir:
- Mülakatı Yapacak Kişinin Unvanı (Interviewer Title): "${interviewerTitle}"
- Adayın Başvurduğu Hedef Rol: "${targetRole || 'Genel Rol'}"
- Deneyim Seviyesi: "${experienceLevel || 'Üniversite Mezunu / Yeni Mezun'}"
- Sektör: "${industry || 'Genel Teknoloji / İş Dünyası'}"
- Ekstra Aday Notları / Şirket Bilgisi: "${specialNotes || 'Belirtilmedi'}"

Lütfen adayın karşısındaki mülakatçının ("${interviewerTitle}") bakış açısını, psikolojisini, adayda arayacağı gizli sinyalleri ve adayı test etmek için soracağı en kritik ve gerçekçi 6 ila 8 mülakat sorusunu üret.
Eğer aday üniversite mezunu / yeni mezun ise; okul projeleri, öğrenme çevikliği, teoriyi pratiğe dökme, takım çalışması ve potansiyeli sınayan derin sorulara da yer ver.

Sorular şu 5 temel kategoriye dengeli dağılmalıdır:
1. Davranışsal & Kültür Uyumu
2. Teknik & Problem Çözme
3. Liderlik / İnisiyatif / Takım Çalışması
4. Kriz / Zorlu Durum Yönetimi
5. Gelecek Vizyonu & Motivasyon

Her soru için adayın STAR (Durum, Görev, Eylem, Sonuç) tekniğiyle nasıl yanıt vermesi gerektiğine dair somut ipuçları sağla.

Tüm çıktı Türkçe olmalı ve aşağıdaki JSON şemasına harfiyen uymalıdır.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Sen uzman bir İK Direktörü ve Mülakat Koçusun. Yalnızca geçerli JSON formatında, Türkçe dilinde profesyonel ve gerçekçi içerik üret.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerPersona: {
              type: Type.OBJECT,
              properties: {
                interviewerTitle: { type: Type.STRING },
                mindset: { type: Type.STRING },
                corePriorities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                coachingTip: { type: Type.STRING },
                potentialTraps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'interviewerTitle',
                'mindset',
                'corePriorities',
                'coachingTip',
                'potentialTraps',
              ],
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING }, // 'Kolay' | 'Orta' | 'Zorlu'
                  questionText: { type: Type.STRING },
                  whatTheyLookFor: { type: Type.STRING },
                  starGuide: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING },
                    },
                    required: ['situation', 'task', 'action', 'result'],
                  },
                  recommendedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'id',
                  'category',
                  'difficulty',
                  'questionText',
                  'whatTheyLookFor',
                  'starGuide',
                  'recommendedKeywords',
                ],
              },
            },
          },
          required: ['interviewerPersona', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: error?.message || 'Mülakat soruları üretilirken bir hata oluştu.',
    });
  }
});

// 2. Endpoint: Evaluate Interview Answer with STAR Methodology + Counter-Attack Simulation
app.post('/api/interview/evaluate-star', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      questionText,
      userAnswer,
      category,
      experienceLevel,
    } = req.body;

    if (!questionText || !userAnswer) {
      return res.status(400).json({ error: 'Soru ve aday cevabı zorunludur.' });
    }

    const prompt = `
Sen mülakat simülasyonunu yöneten ve mülakatı yapan "${interviewerTitle || 'Kıdemli Mülakatçı'}" rolündesin.
Adayın hedef pozisyonu: "${targetRole || 'Pozisyon Belirtilmedi'}"
Adayın deneyim profili: "${experienceLevel || 'Üniversite Mezunu / Yeni Mezun'}"
Soru: "${questionText}"
Kategori: "${category || 'Genel'}"

Adayın Yanıtı:
"""
${userAnswer}
"""

Lütfen bu yanıtı STAR (Durum, Görev, Eylem, Sonuç) metodolojisi çerçevesinde derinlemesine değerlendir:
1. Durum (Situation): Aday bağlamı, ortamı ve arka planı net aktardı mı? (0-25 puan)
2. Görev (Task): Kendisine düşen sorumluluğu ve çözülmesi gereken hedefi açıkça belirtti mi? (0-25 puan)
3. Eylem (Action): Başkalarını değil, KENDİSİNİN aldığı somut aksiyonları ve kararları anlattı mı? (0-25 puan)
4. Sonuç (Result): Ölçülebilir, somut çıktı ve kazanılan dersi aktardı mı? (0-25 puan)

Ardından:
- Toplam puan (0-100)
- Güçlü yönler
- Eksik veya zayıf kalan kısımlar
- Bu yanıtın STAR kuralına göre baştan yazılmış mükemmel örnek versiyonu (Exemplary STAR Model Response)
- Mülakatçının ("${interviewerTitle}") bu yanıttan sonra adayı terletecek şekilde soracağı 1 adet gerçekçi, zorlu "Karşı Atak / Takip Sorusu" (Challenging Counter-Question)
- Adayın bu karşı atak sorusuna nasıl karşılık vermesi gerektiğine dair koçluk tavsiyesi.

Tüm çıktı Türkçe olmalı ve aşağıdaki JSON şemasına uymalıdır.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Sen adayı geliştiren ve gerçekçi geri bildirim veren uzman bir mülakat simülatörüsün. Yalnızca geçerli JSON üret.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                situationScore: { type: Type.INTEGER },
                taskScore: { type: Type.INTEGER },
                actionScore: { type: Type.INTEGER },
                resultScore: { type: Type.INTEGER },
                totalScore: { type: Type.INTEGER },
              },
              required: [
                'situationScore',
                'taskScore',
                'actionScore',
                'resultScore',
                'totalScore',
              ],
            },
            starAnalysis: {
              type: Type.OBJECT,
              properties: {
                situationAnalysis: { type: Type.STRING },
                taskAnalysis: { type: Type.STRING },
                actionAnalysis: { type: Type.STRING },
                resultAnalysis: { type: Type.STRING },
              },
              required: [
                'situationAnalysis',
                'taskAnalysis',
                'actionAnalysis',
                'resultAnalysis',
              ],
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            exemplaryAnswer: { type: Type.STRING },
            counterQuestion: {
              type: Type.OBJECT,
              properties: {
                interviewerTone: { type: Type.STRING },
                questionText: { type: Type.STRING },
                strategyTip: { type: Type.STRING },
              },
              required: ['interviewerTone', 'questionText', 'strategyTip'],
            },
          },
          required: [
            'scores',
            'starAnalysis',
            'strengths',
            'areasForImprovement',
            'exemplaryAnswer',
            'counterQuestion',
          ],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating STAR answer:', error);
    res.status(500).json({
      error: error?.message || 'STAR değerlendirmesi yapılırken bir hata oluştu.',
    });
  }
});

// 3. Endpoint: Analyze Completed Trainings & Recommend Next Step Education Roadmap
app.post('/api/career/roadmap', async (req, res) => {
  try {
    const {
      completedTrainingsText,
      targetCareerGoal,
      currentBackground,
      isNewGraduate,
    } = req.body;

    if (!completedTrainingsText) {
      return res.status(400).json({
        error: 'Lütfen katıldığınız veya tamamladığınız eğitimleri giriniz.',
      });
    }

    const prompt = `
Sen üst düzey bir Kariyer Gelişim Stratejisti ve Eğitim Danışmanısın (Executive Career Mentor & L&D Specialist).
Kullanıcının eğitim ve kariyer profili:
- Adayın Mevcut Durumu / Arka Planı: "${currentBackground || 'Üniversite Mezunu / Kariyer Başlangıcı'}"
- Üniversiteden Yeni Mezun mu?: ${isNewGraduate ? 'EVET (Yeni Mezun / Giriş Seviyesi)' : 'HAYIR (Profesyonel)'}
- Hedeflenen Kariyer Rolü / Sonraki Basamak: "${targetCareerGoal || 'Alana uygun bir üst pozisyon'}"

Adayın Katıldığı / Tamamladığı Eğitimlerin İçeriği ve Sertifikaları:
"""
${completedTrainingsText}
"""

Lütfen bu eğitim içeriklerini titizlikle analiz et:
1. Kazanılmış Güçlü Yetkinlikler (Mevcut eğitimlerle edinilen somut bilgi ve araçlar)
2. Kritik Beceri Açıkları (Skill Gap Analysis - Hedef role ulaşmak veya piyasada öne geçmek için kesinlikle eksik kalan noktalar)
3. Bir Sonraki Adım İçin "Hemen Alınması Gereken 1 Numaralı Öncelikli Eğitim" (Spesifik başlık, neden ilk bu eğitimin seçilmesi gerektiği, müfredat ana başlıkları ve tavsiye edilen sertifika/platform türleri)
4. Alternatif & Tamamlayıcı Eğitim Konuları (Kısa vadede değeri artıracak ek başlıklar)
5. 3 Aşamalı Kişisel Yol Haritası (Milestones):
   - Aşama 1: Temel Boşlukları Kapatma (Önümüzdeki 1-2 ay)
   - Aşama 2: Pratik Projeler & Portfolyo / Derinleşme (3-4. aylar)
   - Aşama 3: Mülakatlara Hazır Üst Yetkinlik (5-6. aylar)
6. Üniversite Mezunları ve İş Arayanlar İçin Özel Koçluk Tavsiyesi (Eğitimleri teoride bırakmayıp nasıl mülakatta kanıtlayacaklarına dair strateji).

Tüm çıktı Türkçe olmalı ve aşağıdaki JSON şemasına harfiyen uymalıdır.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Sen üst düzey kariyer ve yetkinlik mimarısın. Yalnızca geçerli JSON formatında, somut ve harekete geçirici Türkçe tavsiyeler üret.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            acquiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            skillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  severity: { type: Type.STRING }, // 'Kritik' | 'Yüksek' | 'Orta'
                  impactOnTargetRole: { type: Type.STRING },
                },
                required: ['skillName', 'severity', 'impactOnTargetRole'],
              },
            },
            immediateNextTraining: {
              type: Type.OBJECT,
              properties: {
                trainingTitle: { type: Type.STRING },
                whyThisFirst: { type: Type.STRING },
                estimatedDuration: { type: Type.STRING },
                keyTopicsToMaster: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedPlatformsOrCertifications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                projectIdeaToApplyKnowledge: { type: Type.STRING },
              },
              required: [
                'trainingTitle',
                'whyThisFirst',
                'estimatedDuration',
                'keyTopicsToMaster',
                'suggestedPlatformsOrCertifications',
                'projectIdeaToApplyKnowledge',
              ],
            },
            secondaryRecommendedTrainings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  importanceReason: { type: Type.STRING },
                },
                required: ['title', 'category', 'importanceReason'],
              },
            },
            roadmapMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  timeline: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  actionItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  expectedDeliverable: { type: Type.STRING },
                },
                required: [
                  'phase',
                  'timeline',
                  'objective',
                  'actionItems',
                  'expectedDeliverable',
                ],
              },
            },
            graduateOrJobSeekerAdvice: { type: Type.STRING },
          },
          required: [
            'executiveSummary',
            'acquiredSkills',
            'skillGaps',
            'immediateNextTraining',
            'secondaryRecommendedTrainings',
            'roadmapMilestones',
            'graduateOrJobSeekerAdvice',
          ],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating career roadmap:', error);
    res.status(500).json({
      error:
        error?.message ||
        'Kariyer ve eğitim yol haritası oluşturulurken bir hata oluştu.',
    });
  }
});

// 4. Endpoint: Transcribe Audio using gemini-3.5-transcribe
app.post('/api/audio/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Ses verisi bulunamadı.' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Bu ses kaydını Türkçeye transkribe et. Yalnızca konuşulan Türkçe kelimeleri eksiksiz ve doğal noktalama işaretleriyle metin olarak aktar. Hiçbir ek açıklama veya başlık yazma.',
          },
        ],
      },
    });

    const transcription = response.text?.trim() || '';
    res.json({ text: transcription });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({
      error: error?.message || 'Ses transkripsiyonu sırasında hata oluştu.',
    });
  }
});

// 5. Endpoint: Text-to-Speech using gemini-3.8-flash-lite-tts
app.post('/api/audio/speech', async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Seslendirilecek metin zorunludur.' });
    }

    // Limit text length for fast responsiveness in TTS
    const cleanText = text.slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Professional, articulate Turkish interview coach and hiring manager',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Ses sentezlenemedi.' });
    }

    res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({
      error: error?.message || 'Metin sese dönüştürülürken bir hata oluştu.',
    });
  }
});

// Vite Middleware for development & Static Files for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Career Coach Agent server running on port ${port}`);
  });
}

startServer();
