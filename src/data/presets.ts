export interface PresetTitle {
  title: string;
  category: string;
  defaultRole: string;
  defaultLevel: string;
}

export const INTERVIEWER_TITLE_PRESETS: PresetTitle[] = [
  {
    title: 'Üniversite & Kampüs İşe Alım Uzmanı (Campus Recruiter)',
    category: 'Yeni Mezun / İK',
    defaultRole: 'Junior / Yeni Mezun Yazılım Mühendisi',
    defaultLevel: 'Üniversite Mezunu / Yeni Mezun',
  },
  {
    title: 'Senior Engineering Manager (Yazılım Mühendisliği Yöneticisi)',
    category: 'Teknoloji',
    defaultRole: 'Full-Stack Developer',
    defaultLevel: 'Junior (0-2 Yıl)',
  },
  {
    title: 'Head of Product (Ürün Yönetimi Lideri)',
    category: 'Ürün & Tasarım',
    defaultRole: 'Associate Product Manager',
    defaultLevel: 'Üniversite Mezunu / Yeni Mezun',
  },
  {
    title: 'Kıdemli İK Direktörü (HR Director / Talent Acquisition Lead)',
    category: 'İK & Kültür',
    defaultRole: 'Management Trainee (MT)',
    defaultLevel: 'Üniversite Mezunu / Yeni Mezun',
  },
  {
    title: 'Lead Data Scientist & Analytics Manager',
    category: 'Veri & Yapay Zeka',
    defaultRole: 'Junior Data Scientist / Analist',
    defaultLevel: 'Junior (0-2 Yıl)',
  },
  {
    title: 'Chief Technology Officer (CTO)',
    category: 'C-Level & Strateji',
    defaultRole: 'Backend Developer',
    defaultLevel: 'Mid-Level (2-5 Yıl)',
  },
];

export interface TrainingTemplate {
  name: string;
  badge: string;
  targetGoal: string;
  background: string;
  isNewGraduate: boolean;
  content: string;
}

export const TRAINING_TEMPLATES: TrainingTemplate[] = [
  {
    name: 'Üniversite Bilgisayar Mühendisliği Mezunu (Temel Yazılım)',
    badge: 'Yeni Mezun Yazılımcı',
    targetGoal: 'Junior Full-Stack Web Geliştirici',
    background: 'Bilgisayar Mühendisliği Yeni Mezunu (Lisans)',
    isNewGraduate: true,
    content: `1. Üniversite Lisans Müfredatı: Veri Yapıları ve Algoritmalar, Nesne Yönelimli Programlama (Java), İşletim Sistemleri, İlişkisel Veritabanı Sistemleri (SQL).
2. Online Eğitim Platformu Kursu: "Modern Web Geliştirme Temelleri" (HTML5, CSS3, Temel JavaScript ES6, DOM Manipülasyonu - 40 saat).
3. Üniversite Bitirme Tezi Projesi: "Öğrenci Kütüphane Takip Web Uygulaması" (PHP ve MySQL ile geliştirilmiş temel CRUD sistemi).
4. Git & GitHub Temelleri Atölyesi (Branch yönetimi, commit standartları - 6 saat).
5. Katılınan Seminer: "Yapay Zeka ve Yazılım Sektöründe Kariyer" (2 saatlik üniversite kulüp etkinliği).`,
  },
  {
    name: 'Veri Analizi & İş Zekası Başlangıç Paketi',
    badge: 'Veri Analitiği',
    targetGoal: 'Junior Veri Analisti / BI Uzmanı',
    background: 'Endüstri Mühendisliği / İstatistik Mezunu',
    isNewGraduate: true,
    content: `1. Lisans Eğitimi: Olasılık ve İstatistik, Yöneylem Araştırması, Üretim Planlama.
2. Online Sertifika Programı: "Python ile Veri Analizi" (NumPy, Pandas, Matplotlib ile veri temizleme ve görselleştirme - 30 saat).
3. Sertifika: "İleri Excel ve Finansal Modelleme" (VLOOKUP, XLOOKUP, Pivot Tablolar, Macro temelleri - 15 saat).
4. Coursera Kursu: "SQL for Data Science" (SELECT, JOIN, GROUP BY, alt sorgular, pencere fonksiyonları - 20 saat).
5. Üniversite Projesi: "E-Ticaret Müşteri Davranışlarının RFM Analizi ile Segmentasyonu" (Jupyter Notebook üzerinde hazır veri seti analizi).`,
  },
  {
    name: 'İşletme & Yönetim Trainee (MT) / İK Başlangıç',
    badge: 'Yönetim & İK',
    targetGoal: 'İnsan Kaynakları Uzman Yardımcısı / Management Trainee',
    background: 'İşletme / Çalışma Ekonomisi Yeni Mezunu',
    isNewGraduate: true,
    content: `1. Lisans Müfredatı: Örgütsel Davranış, Temel İnsan Kaynakları Yönetimi, Pazarlama İlkeleri, İş Hukuku Temelleri.
2. Sertifika: "İş Dünyasında Profesyonel İletişim ve Müzakere Becerileri" (İstanbul İşletme Enstitüsü - 12 saat).
3. LinkedIn Learning: "Agile & Scrum Temelleri" (Sprint planlama, çevik ekip dinamikleri - 8 saat).
4. Atölye: "Yeni Nesil İşe Alım Trendleri ve Yetkinlik Bazlı Mülakatlar" (İK Zirvesi - 6 saat).
5. Kulüp Deneyimi: Üniversite Kariyer Kulübü Başkan Yardımcılığı (20 şirketin katıldığı kariyer fuarı organizasyonu).`,
  },
  {
    name: 'Frontend Geliştirici Geçiş & Sertifika Paketi',
    badge: 'Web & Mobil',
    targetGoal: 'Frontend Developer (React & TypeScript)',
    background: 'Farklı Mühendislik Mezunu (Alaylı/Kendi Kendini Yetiştiren)',
    isNewGraduate: false,
    content: `1. Bootcamp Eğitimi: "Frontend Web Development" (HTML5, Responsive CSS, Tailwind CSS, Modern JavaScript - 120 saat).
2. Udemy Kursu: "React 19, Redux Toolkit & Next.js Sıfırdan İleri Seviyeye" (Component mimarisi, Hooks, State management - 45 saat).
3. Mini Projeler: Hava durumu uygulaması, E-Ticaret sepet modülü, Görev yöneticisi (To-Do app).
4. Rest API Entegrasyonu: Fetch API ve Axios ile veri çekme pratikleri.
5. Figma to Code: Tasarımları koda dönüştürme atölyesi (10 saat).`,
  },
];
