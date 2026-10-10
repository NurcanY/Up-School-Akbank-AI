# Kariyer ve Mülakat Koçu Asistanı (Career Coach Agent)

Kullanıcının gireceği mülakatlardaki görüşmecinin unvanına (örn. Engineering Manager, HR Lead, Head of Product) göre potansiyel sorular üreten, interaktif STAR analiziyle sesli/yazılı simülasyon sunan ve tamamlanan eğitim içeriklerini analiz ederek kişiselleştirilmiş beceri açığı ve bir sonraki adım eğitim yol haritası çıkaran Türkçe kariyer asistanı.

## Kullanıcı İncelemesi & Kritik Kararlar

> [!IMPORTANT]
> Kullanıcı ile 1. Aşama soru-cevap sürecinde teyit edilen tercihler doğrultusunda sistem mimarisi aşağıdaki temellere oturtulmuştur:

- **Mülakat Hazırlığı & Simülasyon**: Yalnızca statik soru listelemek yerine; görüşmeci unvanına göre dinamik soru üretimi, karşı atak (follow-up) soruları içeren sesli/yazılı interaktif simülasyon ve STAR (Durum, Görev, Eylem, Sonuç) metodolojisiyle detaylı geri bildirim mekanizması uygulanacaktır.
- **Eğitim Analizi & Gelişim Çıktısı**: Kullanıcının tamamladığı eğitimlerin içeriklerinden hareketle hem *Beceri Açığı Analizi (Skill Gap)* hem de *Adım Adım Kişisel Öğrenme Yol Haritası (Milestones)* ile *Spesifik Sertifika & Konu Tavsiyeleri* entegre tek bir stratejik panelde sunulacaktır.
- **Dil & İletişim Tercihi**: Uygulama arayüzü, prompt mimarisi ve simülasyon dili tamamen Türkçe olacaktır.

---

## 1. Genel Bakış & Çözüm Vizyonu

- **Uygulamanın Amacı**: Profesyonellerin iş görüşmelerine görüşmeci unvanı özelinde stratejik hazırlanmalarını sağlamak, mülakat performanslarını STAR puanlama sistemiyle geliştirmek ve geçmiş eğitimlerini analiz ederek kariyer basamaklarındaki bir sonraki eğitim hamlesini netleştirmek.
- **Hedef Kitle**: Mülakata hazırlanan yazılımcılar, yöneticiler, ürün liderleri, analistler ve kariyerinde dikey/yatay geçiş planlayan profesyoneller.
- **Sağlanan Temel Değer**:
  1. *Unvan Odaklı Akıllı Soru Üretimi*: Görüşmecinin unvanına göre (Teknik Lider, İK, C-Level, Bölüm Direktörü) perspektif, soru derinliği ve beklenti analizi.
  2. *Canlı Simülasyon & STAR Koçluğu*: Yanıtları sesle veya metinle girme imkanı, ardından STAR (Situation, Task, Action, Result) kriterlerine göre 100 üzerinden puanlama ve karşı atak (challenging follow-up) soruları.
  3. *Eğitim Envanteri & Stratejik Yol Haritası*: Tamamlanan kursların konularını ayrıştırarak güçlü yönleri, kritik beceri açıklarını ve 3-6 aylık somut eğitim/sertifika önerilerini çıkarma.

---

## 2. Kullanıcı Deneyimi & Görsel Tasarım

### Temel Kullanıcı Akışları
1. **Unvan Odaklı Soru Laboratuvarı**:
   - Kullanıcı görüşmeci unvanını girer (örn. "Senior Engineering Manager", "Head of People", "Fintech Product Director"). İsteğe bağlı olarak hedef pozisyonu ve şirket sektörünü ekler.
   - Gemini 3.8 Flash, görüşmecinin psikolojik ve teknik beklenti haritasını, 5 ana kategoride (Davranışsal, Liderlik, Teknik/Metodolojik, Kriz Yönetimi, Stratejik Vizyon) potansiyel soruları ve değerlendirme kriterlerini üretir.
2. **İnteraktif Mülakat & STAR Simülasyonu**:
   - Kullanıcı dilediği soruyu seçip "Simülasyonu Başlat" butonuna tıklar.
   - Yanıtını mikrofon ile konuşarak (Web Speech API) veya metin olarak girer.
   - Asistan anında STAR analizi yapar: Durum (S), Görev (T), Eylem (A), Sonuç (R) bileşenlerinin doygunluğunu değerlendirir; geliştirilmesi gereken noktaları ve görüşmecinin sorabileceği 1 sert "Karşı Atak Sorusu" sunar.
3. **Eğitim Envanteri & Kariyer Yol Haritası**:
   - Kullanıcı tamamladığı eğitimlerin başlıklarını, içerik özetlerini veya sertifikalarını girer (örnek şablonları tek tıkla yükleme imkanı).
   - Hedef kariyer unvanını belirtir.
   - Asistan beceri haritası çıkarır: "Kazanılan Yetkinlikler", "Kritik Açıklar (Skill Gaps)", "Önerilen 1. Öncelikli Eğitim Adımı", "Spesifik Sertifikasyon & Kaynak Tavsiyeleri" ve "90 Günlük Gelişim Yol Haritası".
4. **Kayıt & Dışa Aktarma**:
   - Simülasyon oturumları ve eğitim yol haritaları yerel saklama (LocalStorage) ile saklanır; PDF veya Markdown formatında kopyalanıp dışa aktarılabilir.

### Görsel Tasarım & Estetik Yönergeler
- **Aestetik Yönelim**: Prestijli, odaklı, profesyonel SaaS kariyer stüdyosu. Rafine kurumsal tipografi ve dengeli boşluk kullanımı.
- **Renk Paleti**:
  - Arka Plan: Koyu derin slate (`#0B0F19`) veya aydınlık mod için ferah kağıt beyazı (`#F8FAFC`).
  - Kart ve Yüzeyler: Temiz sınır çizgili (`border-slate-800`), hafif yükseltmeli yüzeyler.
  - Vurgu & Aksiyon: Asil indigo-mavi (`#4F46E5` / `#6366F1`) ve başarı zümrüdü (`#10B981`).
  - Metinler: Net okunabilir nötr tonlar (`text-slate-100`, `text-slate-400`).
- **Tipografi**:
  - Başlıklar: Karakterli ve modern `Plus Jakarta Sans` veya `Outfit`.
  - Gövde Metinleri: Yüksek okunabilirlikli `Plus Jakarta Sans` / `DM Sans`.
  - Puanlar & Metrikler: `font-mono tabular-nums`.
- **Anti-Slop Kuralları**:
  - Asla statik hap kutucuklar (pill badges) ve gereksiz parlak süslemeler kullanılmayacak.
  - Etiket ve metadatalar noktalı zarif tipografik ayrıcılarla (`·`) sunulacak.
  - Tüm butonlar ve etkileşimli alanlar gerçek işlevsel event handler'lara sahip olacak.

---

## 3. Temel Ürün Kararları & Tercihler

- **Karar 1: Yapay Zeka Entegrasyon Mimarisi (Server-Side Proxy)**:
  - *Seçilen Yaklaşım*: Express backend proxy rotaları (`/api/interview/generate-questions`, `/api/interview/simulate-star`, `/api/career/roadmap`) üzerinden `@google/genai` ve `gemini-3.8-flash` model çağrısı.
  - *Gerekçe*: API anahtarını tarayıcıda ifşa etmeme standartlarına tam uyum ve yüksek yanıt kararlılığı.
- **Karar 2: Sesli ve Yazılı Yanıt Girişi**:
  - *Seçilen Yaklaşım*: Modern tarayıcılarda Web Speech Recognition API ile sıfır harici bağımlılıkla Türkçe konuşmadan metne dönüştürme (STT) desteği + klavye metin girişi.
  - *Gerekçe*: Kullanıcıya gerçek bir mülakattaymış gibi konuşarak pratik yapma özgürlüğü sağlarken ek API maliyeti yaratmaz.
- **Karar 3: STAR Metodolojisi Puanlaması**:
  - *Seçilen Yaklaşım*: Yapılandırılmış JSON şemasıyla her STAR bileşenine (Durum, Görev, Eylem, Sonuç) puan, doğrudan yapıcı eleştiri ve ardından bir sonraki tur için 1 adet gerçekçi karşı soru oluşturma.
  - *Gerekçe*: Adayın mülakatta zayıf kaldığı kısımları (özellikle ölçülebilir sonuç belirtmeme veya bireysel eylemi anlatmama hatası) anında görmesini sağlar.

---

## 4. Teknik Mimari & Veri Stratejisi

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Tailwind CSS)              │
│                                                                        │
│  ┌───────────────────────┐ ┌────────────────────────────────────────┐ │
│  │     Mülakat Laboratuvarı   │ │        Eğitim & Kariyer Analizi        │ │
│  │ ───────────────────── │ │ ────────────────────────────────────── │ │
│  │ • Görüşmeci Unvan Girişi│ │ • Alınan Eğitim İçerikleri Girişi      │ │
│  │ • Rol & Sektör Filtresi  │ │ • Örnek Şablonlar (Yazılım, Veri, İK) │ │
│  │ • Rol Beklenti Özeti     │ │ • Hedef Pozisyon Seçimi               │ │
│  │ • 5 Kategoride Sorular   │ │ • Beceri Açığı (Skill Gap) Matrisi    │ │
│  └───────────┬───────────┘ └───────────────────┬────────────────────┘ │
│              │                                 │                       │
│  ┌───────────▼─────────────────────────────────▼─────────────────────┐ │
│  │               Canlı Mülakat Simülatörü (STAR Engine)              │ │
│  │  • Sesli / Yazılı Giriş (Web Speech API)                          │ │
│  │  • Durum/Görev/Eylem/Sonuç Puanlama ve Koç Analizi                │ │
│  │  • Karşı Atak Sorusu ve İyileştirme Önerisi                       │ │
│  └───────────────────────────┬───────────────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │ HTTP POST JSON
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Server Proxy Backend (Express Node.js / Server.ts)       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ POST /api/interview/generate-questions                           │  │
│  │ POST /api/interview/evaluate-star                                │  │
│  │ POST /api/career/roadmap                                         │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ @google/genai (gemini-3.8-flash)  │
│                                     ▼                                  │
│                       Google Gemini AI API                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Durum Yönetimi & Veri Modeli
- **InterviewPersonaState**:
  - `interviewerTitle`: string (örn: "Engineering Director")
  - `targetRole`: string (örn: "Senior Backend Developer")
  - `seniorityLevel`: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
  - `perspectiveAnalysis`: Görüşmecinin bu rolde nelere dikkat edeceğine dair koç notu
  - `questions`: Kategori, zorluk derecesi, soru metni, görüşmecinin beklentisi ve ideal yanıt ipuçları
- **SimulationTurnState**:
  - `selectedQuestion`: Soru objesi
  - `userAnswer`: string (yazılı veya sesten dönüştürülmüş)
  - `starScore`: `{ situation: number, task: number, action: number, result: number, total: number }`
  - `feedback`: Olumlu yönler, eksik kalan STAR parçaları, alternatif örnek yanıt
  - `counterQuestion`: Görüşmecinin bu yanıta vereceği zorlayıcı takip sorusu
- **TrainingRoadmapState**:
  - `completedTrainings`: `[{ id, title, duration, topicsCovered, date }]`
  - `targetGoal`: string
  - `skillsAcquired`: Kazanılmış güçlü beceriler
  - `missingGaps`: Kariyer basamağında eksik olan kritik donanımlar
  - `recommendedNextTrainings`: Öncelikli eğitim başlıkları, içerik kapsamı ve sertifika referansları
  - `timelineRoadmap`: 3 aşamalı (Kısa, Orta, Uzun vade) somut gelişim planı

---

## 5. Doğrulama & Derleme Adımları
1. Server altyapısı ve Gemini API proxy uç noktalarının oluşturulması (`server.ts`, `vite.config.ts` entegrasyonu).
2. Frontend koç modüllerinin, STAR sesli/yazılı simülasyon motorunun ve eğitim analiz panellerinin inşası.
3. Test ve derleme kontrolü (`compile_applet`).
