const API_URL = "https://mert-cv-bot.onrender.com"; // Local geliştirme için. Deploy sonrası Render/Railway URL'i ile değiştirin.

const form = document.getElementById("chat-form");
const input = document.getElementById("question");
const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");
const profilePhoto = document.getElementById("profile-photo");

let isLoading = false;

// İstatistikler
let stats = {
  totalQuestions: parseInt(localStorage.getItem('totalQuestions') || '0'),
  sessionStartTime: Date.now(),
  responseTimes: JSON.parse(localStorage.getItem('responseTimes') || '[]'),
  topics: JSON.parse(localStorage.getItem('topics') || '{}'),
  lastResponse: null
};

// İstatistikleri güncelle - opsiyonel, hata olursa atlanır
function updateStatsSafely(question, answer, responseTime) {
  try {
    if (!stats || !responseTime || !question) return; // Gerekli veriler yoksa atla
    
    // Güvenli kontrollerle güncelle
    if (typeof stats.totalQuestions === 'number') {
      stats.totalQuestions++;
    }
    if (Array.isArray(stats.responseTimes)) {
      stats.responseTimes.push(responseTime);
    }
    
    // Konu analizi (basit keyword matching)
    if (typeof question === 'string') {
      const keywords = {
        'backend': ['backend', 'api', 'server', 'database', 'sql', 'oracle'],
        'frontend': ['frontend', 'angular', 'html', 'css', 'javascript', 'ui'],
        'projeler': ['proje', 'project', 'uygulama', 'application'],
        'deneyim': ['deneyim', 'experience', 'tecrübe', 'staj', 'intern'],
        'teknoloji': ['teknoloji', 'technology', 'teknoloji', 'framework', 'tool']
      };
      
      const questionLower = question.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => questionLower.includes(word))) {
          if (!stats.topics) stats.topics = {};
          stats.topics[topic] = (stats.topics[topic] || 0) + 1;
        }
      });
    }
    
    // LocalStorage'a kaydet - hata olursa atla
    try {
      if (typeof stats.totalQuestions === 'number') {
        localStorage.setItem('totalQuestions', stats.totalQuestions.toString());
      }
      if (Array.isArray(stats.responseTimes)) {
        localStorage.setItem('responseTimes', JSON.stringify(stats.responseTimes));
      }
      if (stats.topics && typeof stats.topics === 'object') {
        localStorage.setItem('topics', JSON.stringify(stats.topics));
      }
    } catch (storageErr) {
      // LocalStorage hatası - sessizce atla
    }
  } catch (err) {
    // Herhangi bir hata olursa sessizce atla - istatistikler opsiyonel
  }
}

// Fotoğraf yüklenemezse fallback
if (profilePhoto) {
  profilePhoto.onerror = function() {
    this.style.display = 'none';
    const avatar = this.parentElement;
    avatar.innerHTML = 'M';
    avatar.style.fontWeight = '700';
    avatar.style.fontSize = '1.5rem';
    avatar.style.color = '#000000';
  };
}

// Sosyal medya linklerini ayarla
const linkedinLink = document.getElementById("linkedin-link");
const githubLink = document.getElementById("github-link");

if (linkedinLink) linkedinLink.href = "https://www.linkedin.com/in/mertacarr/";
if (githubLink) githubLink.href = "https://github.com/mertacar-git";

// Dil ve Tema Yönetimi
let currentLang = localStorage.getItem('lang') || 'tr';
let currentTheme = localStorage.getItem('theme') || 'dark';

// Çeviri objesi
const translations = {
  tr: {
    brandTitle: "Mert CV Bot",
    brandSubtitle: "Software Developer • Powered by OpenAI",
    jobTitle: "Junior Software Developer",
    email: "E-posta",
    phone: "Telefon",
    hint: "İş görüşmesi, staj veya teknik ekip için Mert hakkında detaylı sorular sorabilirsiniz.",
    chatTitle: "Konuşma Alanı",
    chatSubtitle: "Mert'in deneyimleri, projeleri, güçlü yönleri hakkında soru sor.",
    welcome: `Merhaba, ben Mert Açar'ın interaktif CV botuyum. Mert hakkında merak ettiğiniz her şeyi
    kurumsal ve net bir dille açıklayabilirim. Örneğin:
    <br /><br />
    • "Mert'in backend tecrübesini özetler misin?"<br />
    • "Baskı altında çalışma ve problem çözme tarafında nasıldır?"<br />
    • "Finansal analiz ve AI çalışmaları hakkında bilgi verir misin?"`,
    now: "Şimdi",
    placeholder: "Mert hakkında bir soru yazın...",
    send: "Gönder",
    sending: "Gönderiliyor...",
    qrTitle: "QR Kod",
    qrText: "Bu QR kodu tarayarak CV'ye erişebilirsiniz",
    quickBackend: "Backend Tecrübesi",
    quickProjects: "Projeler",
    quickStrengths: "Güçlü Yönler",
    quickContact: "İletişim",
    statsTitle: "📊 İstatistikler",
    statQuestions: "Toplam Soru",
    statTime: "Oturum Süresi",
    statAvg: "Ort. Yanıt Süresi",
    statTopics: "Konu Başlığı",
    topicsTitle: "En Çok Sorulan Konular"
  },
  en: {
    brandTitle: "Mert CV Bot",
    brandSubtitle: "Software Developer • Powered by OpenAI",
    jobTitle: "Junior Software Developer",
    email: "Email",
    phone: "Phone",
    hint: "You can ask detailed questions about Mert for job interviews, internships, or technical teams.",
    chatTitle: "Chat Area",
    chatSubtitle: "Ask about Mert's experiences, projects, and strengths.",
    welcome: `Hello, I am Mert Açar's interactive CV bot. I can explain everything you are curious about Mert
    in a corporate and clear language. For example:
    <br /><br />
    • "Can you summarize Mert's backend experience?"<br />
    • "How is he at working under pressure and problem solving?"<br />
    • "Can you provide information about financial analysis and AI studies?"`,
    now: "Now",
    placeholder: "Ask a question about Mert...",
    send: "Send",
    sending: "Sending...",
    qrTitle: "QR Code",
    qrText: "Scan this QR code to access the CV",
    quickBackend: "Backend Experience",
    quickProjects: "Projects",
    quickStrengths: "Strengths",
    quickContact: "Contact",
    statsTitle: "📊 Statistics",
    statQuestions: "Total Questions",
    statTime: "Session Duration",
    statAvg: "Avg. Response Time",
    statTopics: "Topics Discussed",
    topicsTitle: "Most Asked Topics"
  }
};

// Dil değiştirme
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  updateTranslations();
  const langMenu = document.getElementById('lang-menu');
  if (langMenu) langMenu.classList.add('hidden');
}

function updateTranslations() {
  const t = translations[currentLang];
  const elements = {
    'brand-title': t.brandTitle,
    'brand-subtitle': t.brandSubtitle,
    'job-title': t.jobTitle,
    'email-text': t.email,
    'phone-text': t.phone,
    'hint-text': t.hint,
    'chat-title': t.chatTitle,
    'chat-subtitle': t.chatSubtitle,
    'welcome-message': t.welcome,
    'now-text': t.now
  };
  
  Object.entries(elements).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'welcome-message') {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  
  // Quick questions
  const quickQuestions = {
    'quick-backend': {
      question: currentLang === 'tr' ? 'Mert\'in backend tecrübesi nedir?' : 'What is Mert\'s backend experience?',
      label: t.quickBackend
    },
    'quick-projects': {
      question: currentLang === 'tr' ? 'Mert\'in projeleri nelerdir?' : 'What are Mert\'s projects?',
      label: t.quickProjects
    },
    'quick-strengths': {
      question: currentLang === 'tr' ? 'Mert\'in güçlü yönleri nelerdir?' : 'What are Mert\'s strengths?',
      label: t.quickStrengths
    },
    'quick-contact': {
      question: currentLang === 'tr' ? 'Mert\'in iletişim bilgileri nelerdir?' : 'What are Mert\'s contact details?',
      label: t.quickContact
    }
  };
  
  Object.entries(quickQuestions).forEach(([id, data]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.setAttribute('data-question', data.question);
      btn.textContent = data.label;
    }
  });
  
  const input = document.getElementById('question');
  if (input) input.placeholder = t.placeholder;
  
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn && !isLoading) sendBtn.textContent = t.send;
}

// Tema değiştirme
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
}

function applyTheme() {
  const body = document.body;
  const html = document.documentElement;
  if (currentTheme === 'light') {
    body.classList.add('light-theme');
    html.setAttribute('data-theme', 'light');
  } else {
    body.classList.remove('light-theme');
    html.setAttribute('data-theme', 'dark');
  }
}

// QR Kod oluşturma
function generateQRCode() {
  const currentUrl = window.location.href;
  const qrContainer = document.getElementById('qrcode');
  if (qrContainer) {
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: currentUrl,
      width: 256,
      height: 256,
      colorDark: currentTheme === 'dark' ? '#ffffff' : '#000000',
      colorLight: currentTheme === 'dark' ? '#000000' : '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// Modal yönetimi
function openQRModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.remove('hidden');
    generateQRCode();
  }
}

function closeQRModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Tema uygula
  applyTheme();
  
  // Dil uygula
  updateTranslations();
  
  // Tema toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Dil toggle
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  if (langToggle && langMenu) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('hidden');
    });
    
    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        changeLanguage(lang);
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add('hidden');
      }
    });
  }
  
  // QR Kod
  const qrToggle = document.getElementById('qr-toggle');
  const qrClose = document.getElementById('qr-close');
  if (qrToggle) {
    qrToggle.addEventListener('click', openQRModal);
  }
  if (qrClose) {
    qrClose.addEventListener('click', closeQRModal);
  }
  
  // Modal dışına tıklanınca kapat
  const qrModal = document.getElementById('qr-modal');
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        closeQRModal();
      }
    });
  }
  
  const statsModal = document.getElementById('stats-modal');
  if (statsModal) {
    statsModal.addEventListener('click', (e) => {
      if (e.target === statsModal) {
        statsModal.classList.add('hidden');
      }
    });
  }
  
  // CV İndirme
  const cvDownload = document.getElementById('cv-download');
  if (cvDownload) {
    cvDownload.addEventListener('click', (e) => {
      e.preventDefault();
      // Dil'e göre CV dosyası seç
      const cvPath = currentLang === 'en' 
        ? 'assets/mert-cv-en.pdf' 
        : 'assets/mert-cv-en.pdf'; // Şimdilik her ikisi de aynı dosya
      const fileName = currentLang === 'en' 
        ? 'Mert-Acar-Resume.pdf' 
        : 'Mert-Acar-CV.pdf';
      
      // Dosyanın var olup olmadığını kontrol et
      fetch(cvPath, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            // Dosya varsa indir
            const link = document.createElement('a');
            link.href = cvPath;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // Dosya yoksa uyarı göster
            const t = translations[currentLang];
            const message = currentLang === 'tr' 
              ? `CV dosyası henüz eklenmemiş. Lütfen ${cvPath} dosyasını ekleyin.`
              : `CV file has not been added yet. Please add ${cvPath} file.`;
            alert(message);
          }
        })
        .catch(() => {
          const t = translations[currentLang];
          const message = currentLang === 'tr' 
            ? `CV dosyası bulunamadı. Lütfen ${cvPath} dosyasını ekleyin.`
            : `CV file not found. Please add ${cvPath} file.`;
          alert(message);
        });
    });
  }
  
  // Voice Input (Sesli Soru) - Tüm tarayıcılar için
  const voiceBtn = document.getElementById('voice-btn');
  let recognition = null;
  let isListening = false;
  let microphonePermissionChecked = false;
  
  // Mikrofon iznini kontrol et ve gerekirse iste
  async function checkMicrophonePermission(requestIfNeeded = false) {
    try {
      // Önce permissions API ile kontrol et
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' });
          if (result.state === 'granted') {
            return true;
          } else if (result.state === 'prompt' && requestIfNeeded) {
            // İzin istenebilir durumda, getUserMedia ile iste
            return await requestMicrophonePermission();
          } else if (result.state === 'denied') {
            return false;
          }
        } catch (permErr) {
          console.log('Permissions API not supported or failed:', permErr);
        }
      }
      
      // MediaDevices API ile test et veya iste
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Stream'i kapat
          return true;
        } catch (err) {
          console.log('Microphone permission check/request failed:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            return false;
          }
          return null;
        }
      }
      return null; // Kontrol edilemedi
    } catch (err) {
      console.log('Permission check error:', err);
      return null;
    }
  }
  
  // Mikrofon iznini açıkça iste
  async function requestMicrophonePermission() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        showVoiceFeedback('start', currentLang === 'tr' 
          ? 'Mikrofon izni isteniyor...' 
          : 'Requesting microphone permission...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stream'i kapat
        console.log('Microphone permission granted');
        return true;
      }
      return null;
    } catch (err) {
      console.error('Failed to request microphone permission:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return false;
      }
      return null;
    }
  }
  
  // Tüm olası SpeechRecognition API'lerini kontrol et
  const SpeechRecognition = window.SpeechRecognition || 
                            window.webkitSpeechRecognition || 
                            window.mozSpeechRecognition || 
                            window.msSpeechRecognition;
  
  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Gerçek zamanlı sonuçlar için true
      recognition.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';
      
      if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
          if (!isListening) {
            startVoiceRecognition();
          } else {
            stopVoiceRecognition();
          }
        });
      }
      
      recognition.onstart = () => {
        console.log('Speech recognition started - onstart event fired');
        console.log('onstart event details:', {
          timestamp: new Date().toISOString(),
          isListening: isListening
        });
        
        // Timeout'u iptal et
        if (startTimeoutId) {
          clearTimeout(startTimeoutId);
          startTimeoutId = null;
        }
        
        isListening = true;
        if (voiceBtn) {
          voiceBtn.textContent = '🔴';
          voiceBtn.classList.add('listening');
          voiceBtn.title = currentLang === 'tr' ? 'Dinleniyor... (Durdurmak için tıklayın)' : 'Listening... (Click to stop)';
        }
        // Dinleme başladı mesajı
        showVoiceFeedback('listening');
      };
      
      // onstart event'inin bağlandığını doğrula
      console.log('Speech recognition onstart handler attached:', {
        handler: recognition.onstart,
        type: typeof recognition.onstart
      });
      
      recognition.onresult = (event) => {
        console.log('onresult event fired:', event);
        console.log('Results:', event.results);
        console.log('Result index:', event.resultIndex);
        
        const questionInput = document.getElementById('question');
        if (!questionInput) {
          console.error('Question input not found');
          return;
        }
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Tüm sonuçları işle
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0]) {
            const transcript = event.results[i][0].transcript;
            console.log(`Result ${i}:`, transcript, 'isFinal:', event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
        }
        
        // Final ve interim sonuçları birleştir
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        
        console.log('Full transcript:', fullTranscript);
        console.log('Final transcript:', finalTranscript.trim());
        console.log('Interim transcript:', interimTranscript);
        
        if (fullTranscript) {
          questionInput.value = fullTranscript;
          questionInput.focus();
          
          // Eğer final sonuç varsa (konuşma bitti), otomatik gönder
          if (finalTranscript.trim()) {
            console.log('Final transcript received, will auto-submit:', finalTranscript.trim());
            showVoiceFeedback('success');
            
            // Kısa bir gecikme ile otomatik gönder (kullanıcı görebilsin)
            setTimeout(() => {
              console.log('Auto-submitting form...');
              stopVoiceRecognition();
              // Form'u otomatik gönder
              const form = document.getElementById('chat-form');
              if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
              } else {
                console.error('Form not found for auto-submit');
              }
            }, 800); // 500ms'den 800ms'ye çıkardık
          }
        } else {
          console.log('No transcript to display');
        }
      };
      
      recognition.onerror = async (event) => {
        console.log('Speech recognition error:', event.error, event);
        console.log('Error details:', {
          error: event.error,
          message: event.message,
          isListening: isListening
        });
        
        // no-speech hatası durumunda otomatik göndermeyi dene
        if (event.error === 'no-speech') {
          const questionInput = document.getElementById('question');
          if (questionInput && questionInput.value.trim()) {
            console.log('No speech detected but input has value, auto-submitting...');
            setTimeout(() => {
              stopVoiceRecognition();
              const form = document.getElementById('chat-form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }, 500);
            return;
          }
        }
        
        stopVoiceRecognition();
        
        // Hata mesajı göster
        if (event.error === 'not-allowed') {
          // Mikrofon iznini kontrol et
          const hasPermission = await checkMicrophonePermission();
          if (hasPermission === false) {
            showVoiceFeedback('error', currentLang === 'tr' 
              ? 'Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini verin.' 
              : 'Microphone access denied. Please allow microphone permission in browser settings.');
          } else if (hasPermission === true) {
            showVoiceFeedback('error', currentLang === 'tr' 
              ? 'Mikrofon erişimi sorunu. Lütfen sayfayı yenileyip tekrar deneyin.' 
              : 'Microphone access issue. Please refresh the page and try again.');
          } else {
            showVoiceFeedback('error', currentLang === 'tr' 
              ? 'Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini kontrol edin.' 
              : 'Microphone access denied. Please check microphone permission in browser settings.');
          }
        } else if (event.error === 'no-speech') {
          // no-speech hatası durumunda otomatik göndermeyi dene
          const questionInput = document.getElementById('question');
          if (questionInput && questionInput.value.trim()) {
            console.log('No speech detected but input has value, auto-submitting...');
            setTimeout(() => {
              stopVoiceRecognition();
              const form = document.getElementById('chat-form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }, 500);
            return;
          }
          showVoiceFeedback('error', currentLang === 'tr' 
            ? 'Ses algılanamadı. Lütfen tekrar deneyin.' 
            : 'No speech detected. Please try again.');
        } else if (event.error === 'aborted') {
          // Kullanıcı durdurdu, mesaj gösterme
          return;
        } else if (event.error === 'network') {
          showVoiceFeedback('error', currentLang === 'tr' 
            ? 'Ağ hatası. İnternet bağlantınızı kontrol edin.' 
            : 'Network error. Please check your internet connection.');
        } else if (event.error === 'service-not-allowed') {
          showVoiceFeedback('error', currentLang === 'tr' 
            ? 'Ses tanıma servisi kullanılamıyor. Lütfen daha sonra tekrar deneyin.' 
            : 'Speech recognition service unavailable. Please try again later.');
        } else {
          showVoiceFeedback('error', currentLang === 'tr' 
            ? `Bir hata oluştu: ${event.error}. Lütfen tekrar deneyin.` 
            : `An error occurred: ${event.error}. Please try again.`);
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended - onend event fired');
        console.log('onend state:', { isListening: isListening });
        
        // Eğer input'ta metin varsa ama gönderilmemişse, gönder
        const questionInput = document.getElementById('question');
        if (questionInput && questionInput.value.trim() && isListening) {
          console.log('Recognition ended with text in input, auto-submitting:', questionInput.value);
          setTimeout(() => {
            stopVoiceRecognition();
            const form = document.getElementById('chat-form');
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
          }, 300);
          return;
        }
        
        // Toast'ı kaldır
        const existingToast = document.getElementById('voice-toast');
        if (existingToast) {
          existingToast.classList.remove('show');
          setTimeout(() => {
            if (existingToast.parentNode) {
              existingToast.remove();
            }
          }, 300);
        }
        // Eğer hala dinleme durumundaysa durdur
        if (isListening) {
          stopVoiceRecognition();
        }
      };
      
      // Voice butonu görünür olsun
      if (voiceBtn) {
        voiceBtn.style.display = 'flex';
      }
    } catch (err) {
      console.error('Speech recognition initialization error:', err);
      if (voiceBtn) {
        voiceBtn.style.display = 'none';
      }
    }
  } else {
    // Speech Recognition desteklenmiyor
    if (voiceBtn) {
      voiceBtn.style.display = 'none';
    }
  }
  
  let startTimeoutId = null;
  
  function startVoiceRecognition() {
    if (!recognition) {
      console.error('Speech recognition not initialized');
      return;
    }
    
    if (isListening) {
      console.log('Already listening, ignoring start request');
      return;
    }
    
    // Önce görsel geri bildirim göster
    showVoiceFeedback('start');
    
    // Önce durdur (eğer hala çalışıyorsa)
    try {
      recognition.stop();
      // onend event'inin tetiklenmesi için kısa bir bekleme
      setTimeout(() => {
        actuallyStartRecognition();
      }, 300);
    } catch (stopErr) {
      // Zaten durmuşsa direkt başlat
      actuallyStartRecognition();
    }
  }
  
  async function actuallyStartRecognition() {
    if (!recognition || isListening) {
      return;
    }
    
    // Önce mikrofon iznini kontrol et ve gerekirse iste
    if (!microphonePermissionChecked) {
      // Önce kontrol et
      let hasPermission = await checkMicrophonePermission(false);
      
      // Eğer izin yoksa veya belirsizse, izin iste
      if (hasPermission !== true) {
        console.log('Microphone permission not granted, requesting...');
        hasPermission = await checkMicrophonePermission(true); // İzin iste
      }
      
      microphonePermissionChecked = true;
      
      if (hasPermission === false) {
        showVoiceFeedback('error', currentLang === 'tr' 
          ? 'Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini verin ve sayfayı yenileyin.' 
          : 'Microphone access denied. Please allow microphone permission in browser settings and refresh the page.');
        return;
      } else if (hasPermission === null) {
        // İzin kontrol edilemedi, yine de denemeye devam et
        console.log('Could not determine microphone permission, continuing anyway...');
      }
    }
    
    try {
      recognition.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';
      console.log('Attempting to start speech recognition with lang:', recognition.lang);
      console.log('Recognition state before start:', {
        isListening: isListening,
        hasOnStart: !!recognition.onstart,
        hasOnError: !!recognition.onerror,
        hasOnEnd: !!recognition.onend
      });
      
      // onstart event handler'ını tekrar bağla (bazı tarayıcılarda gerekli)
      let onStartFired = false;
      const originalOnStart = recognition.onstart;
      recognition.onstart = () => {
        console.log('Speech recognition started - onstart event fired');
        onStartFired = true;
        if (originalOnStart) {
          originalOnStart();
        }
      };
      
      recognition.start();
      console.log('recognition.start() called successfully');
      
      // onstart event'inin tetiklenmesini bekle
      // Bazı tarayıcılarda onstart hemen tetiklenmeyebilir
      let checkInterval = null;
      let checkCount = 0;
      const maxChecks = 30; // 3 saniye (100ms * 30)
      
      // İlk kontrol - 500ms sonra
      setTimeout(() => {
        if (!isListening && !onStartFired) {
          console.log('onstart not fired after 500ms, checking state...');
          // Bazı tarayıcılarda onstart tetiklenmeyebilir, manuel olarak başlat
          // Ama önce gerçekten başlamış mı kontrol et
          try {
            // Eğer recognition hala çalışıyorsa, manuel olarak durumu güncelle
            if (!isListening) {
              console.log('Manually updating recognition state (onstart may not fire)');
              isListening = true;
              if (voiceBtn) {
                voiceBtn.textContent = '🔴';
                voiceBtn.classList.add('listening');
                voiceBtn.title = currentLang === 'tr' ? 'Dinleniyor... (Durdurmak için tıklayın)' : 'Listening... (Click to stop)';
              }
              showVoiceFeedback('listening');
              
              // Timeout'u iptal et
              if (startTimeoutId) {
                clearTimeout(startTimeoutId);
                startTimeoutId = null;
              }
              if (checkInterval) {
                clearInterval(checkInterval);
              }
            }
          } catch (err) {
            console.error('Error in manual state update:', err);
          }
        }
      }, 500);
      
      checkInterval = setInterval(() => {
        checkCount++;
        if (isListening || onStartFired) {
          // onstart tetiklendi veya manuel olarak başlatıldı, kontrolü durdur
          console.log('Speech recognition started (detected via polling or event)');
          clearInterval(checkInterval);
          if (startTimeoutId) {
            clearTimeout(startTimeoutId);
            startTimeoutId = null;
          }
        } else if (checkCount >= maxChecks) {
          // 3 saniye geçti, hala başlamadı
          clearInterval(checkInterval);
          console.warn('Speech recognition did not start within 3 seconds');
          console.log('Current recognition state:', {
            isListening: isListening,
            onStartFired: onStartFired,
            recognition: recognition,
            hasOnStart: !!recognition.onstart,
            hasOnError: !!recognition.onerror,
            hasOnEnd: !!recognition.onend
          });
          
          // onerror tetiklenmiş mi kontrol et
          if (startTimeoutId) {
            clearTimeout(startTimeoutId);
            startTimeoutId = null;
          }
          
          showVoiceFeedback('error', currentLang === 'tr' 
            ? 'Mikrofon başlatılamadı. Lütfen tarayıcı konsolunu kontrol edin veya farklı bir tarayıcı deneyin (Chrome/Edge önerilir).' 
            : 'Failed to start microphone. Please check browser console or try a different browser (Chrome/Edge recommended).');
          stopVoiceRecognition();
        }
      }, 100); // Her 100ms'de bir kontrol et
      
      // Fallback timeout (güvenlik için)
      if (startTimeoutId) {
        clearTimeout(startTimeoutId);
      }
      startTimeoutId = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        if (!isListening && !onStartFired) {
          console.warn('Speech recognition timeout - fallback triggered');
          stopVoiceRecognition();
        }
        startTimeoutId = null;
      }, 4000); // 4 saniye fallback timeout
    } catch (startErr) {
      console.error('Error in recognition.start():', startErr);
      if (startErr.name === 'InvalidStateError' && startErr.message.includes('already started')) {
        // Zaten başlamış, sadece durumu güncelle
        console.log('Recognition already started, updating state');
        isListening = true;
        if (voiceBtn) {
          voiceBtn.textContent = '🔴';
          voiceBtn.classList.add('listening');
          voiceBtn.title = currentLang === 'tr' ? 'Dinleniyor... (Durdurmak için tıklayın)' : 'Listening... (Click to stop)';
        }
        showVoiceFeedback('listening');
      } else {
        showVoiceFeedback('error', currentLang === 'tr' 
          ? 'Mikrofon başlatılamadı. Lütfen tekrar deneyin.' 
          : 'Failed to start microphone. Please try again.');
        stopVoiceRecognition();
      }
    }
  }
  
  function stopVoiceRecognition() {
    if (!recognition) {
      return;
    }
    
    // Durumu önce güncelle
    const wasListening = isListening;
    isListening = false;
    
    if (voiceBtn) {
      voiceBtn.textContent = '🎤';
      voiceBtn.classList.remove('listening');
      voiceBtn.title = currentLang === 'tr' ? 'Sesli Soru' : 'Voice Question';
    }
    
    if (wasListening) {
      try {
        recognition.stop();
      } catch (err) {
        // Zaten durmuşsa hata vermez
        console.log('Recognition already stopped or not started');
      }
      showVoiceFeedback('stopped');
    }
  }
  
  // Sesli geri bildirim mesajı göster
  function showVoiceFeedback(type, customMessage = null) {
    // Mevcut mesajı kaldır
    const existingToast = document.getElementById('voice-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    let message = '';
    let icon = '🎤';
    
    if (customMessage) {
      message = customMessage;
    } else {
      const t = translations[currentLang];
      switch (type) {
        case 'start':
          message = currentLang === 'tr' ? 'Mikrofon açılıyor...' : 'Starting microphone...';
          icon = '🎤';
          break;
        case 'listening':
          message = currentLang === 'tr' ? 'Dinleniyor... Konuşun!' : 'Listening... Speak now!';
          icon = '🔴';
          break;
        case 'success':
          message = currentLang === 'tr' ? 'Ses algılandı!' : 'Speech detected!';
          icon = '✅';
          break;
        case 'stopped':
          message = currentLang === 'tr' ? 'Dinleme durduruldu' : 'Listening stopped';
          icon = '⏹️';
          break;
        case 'error':
          message = currentLang === 'tr' ? 'Bir hata oluştu' : 'An error occurred';
          icon = '❌';
          break;
      }
    }
    
    // Toast mesajı oluştur
    const toast = document.createElement('div');
    toast.id = 'voice-toast';
    toast.className = 'voice-toast';
    toast.innerHTML = `<span class="voice-toast-icon">${icon}</span><span class="voice-toast-text">${message}</span>`;
    document.body.appendChild(toast);
    
    // Animasyon için
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Dinleme durumunda özel stil
    if (type === 'listening') {
      toast.classList.add('listening');
    }
    
    // Otomatik kaldır (success ve stopped için kısa, error için uzun, listening için manuel)
    const duration = (type === 'error') ? 4000 : (type === 'listening' ? 0 : 2000);
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }, duration);
    }
    // listening durumu için onend event'inde kaldırılacak
  }
  
  // Quick Questions
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      const input = document.getElementById('question');
      if (input) {
        input.value = question;
        input.focus();
        // Otomatik gönder
        setTimeout(() => {
          form.dispatchEvent(new Event('submit'));
        }, 100);
      }
    });
  });
  
  // Chat Export (Konuşma İndirme)
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportChat();
    });
  }
  
  function exportChat() {
    const messages = document.querySelectorAll('.message');
    let chatText = currentLang === 'tr' 
      ? '=== Mert CV Bot - Konuşma Geçmişi ===\n\n'
      : '=== Mert CV Bot - Chat History ===\n\n';
    
    messages.forEach(msg => {
      const bubble = msg.querySelector('.bubble');
      const meta = msg.querySelector('.meta');
      if (bubble && meta) {
        const text = bubble.textContent || bubble.innerText;
        const time = meta.textContent;
        chatText += `${time}\n${text}\n\n`;
      }
    });
    
    chatText += `\n${currentLang === 'tr' ? 'Oluşturulma Tarihi' : 'Created'}: ${new Date().toLocaleString(currentLang === 'tr' ? 'tr-TR' : 'en-US')}\n`;
    chatText += `${currentLang === 'tr' ? 'CV Linki' : 'CV Link'}: ${window.location.href}\n`;
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mert-cv-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  
  // İstatistikleri göster
  function showStats() {
    const modal = document.getElementById('stats-modal');
    if (!modal) return;
    
    // İstatistikleri hesapla
    const sessionMinutes = Math.floor((Date.now() - stats.sessionStartTime) / 60000);
    const avgResponseTime = stats.responseTimes.length > 0
      ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length / 1000)
      : 0;
    
    // DOM'u güncelle
    const t = translations[currentLang];
    document.getElementById('stats-title').textContent = t.statsTitle;
    document.getElementById('total-questions').textContent = stats.totalQuestions;
    document.getElementById('session-time').textContent = `${sessionMinutes} ${currentLang === 'tr' ? 'dk' : 'min'}`;
    document.getElementById('avg-response-time').textContent = avgResponseTime > 0 ? `${avgResponseTime}s` : '-';
    
    const uniqueTopics = Object.keys(stats.topics).length;
    document.getElementById('topics-discussed').textContent = uniqueTopics;
    
    // Label'ları güncelle
    document.getElementById('stat-questions-label').textContent = t.statQuestions;
    document.getElementById('stat-time-label').textContent = t.statTime;
    document.getElementById('stat-avg-label').textContent = t.statAvg;
    document.getElementById('stat-topics-label').textContent = t.statTopics;
    document.getElementById('topics-title').textContent = t.topicsTitle;
    
    // En çok sorulan konular
    const topicsContainer = document.getElementById('topics-container');
    if (topicsContainer) {
      topicsContainer.innerHTML = '';
      const sortedTopics = Object.entries(stats.topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      if (sortedTopics.length === 0) {
        topicsContainer.innerHTML = `<p style="color: var(--text-dim);">${currentLang === 'tr' ? 'Henüz yeterli veri yok' : 'Not enough data yet'}</p>`;
      } else {
        sortedTopics.forEach(([topic, count]) => {
          const topicEl = document.createElement('div');
          topicEl.className = 'topic-item';
          topicEl.innerHTML = `
            <span class="topic-name">${topic}</span>
            <span class="topic-count">${count}</span>
          `;
          topicsContainer.appendChild(topicEl);
        });
      }
    }
    
    modal.classList.remove('hidden');
  }
  
  // İstatistikler modal
  const statsToggle = document.getElementById('stats-toggle');
  const statsClose = document.getElementById('stats-close');
  if (statsToggle) {
    statsToggle.addEventListener('click', showStats);
  }
  if (statsClose) {
    statsClose.addEventListener('click', () => {
      document.getElementById('stats-modal').classList.add('hidden');
    });
  }
  
  // Text-to-Speech
  const ttsBtn = document.getElementById('tts-btn');
  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      if (stats.lastResponse) {
        const utterance = new SpeechSynthesisUtterance(stats.lastResponse);
        utterance.lang = currentLang === 'tr' ? 'tr-TR' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
        
        // Buton durumunu güncelle
        ttsBtn.textContent = '⏸️';
        utterance.onend = () => {
          ttsBtn.textContent = '🔊';
        };
      } else {
        const message = currentLang === 'tr' 
          ? 'Henüz yanıt yok. Önce bir soru sorun.'
          : 'No response yet. Please ask a question first.';
        alert(message);
      }
    });
  }
});

function addMessage(text, from, isError = false, useTypingEffect = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + (from === "user" ? "user" : "bot");
  if (isError) {
    wrapper.classList.add("error");
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  
  // Bot mesajlarında typing effect kullan
  if (from === "bot" && !isError && useTypingEffect) {
    bubble.innerHTML = '<span class="typing-indicator">|</span>';
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollToBottom();
    
    // Typing effect ile yaz
    typeMessage(bubble, text);
  } else {
    // HTML içeriği için innerHTML kullan (markdown formatı için)
    if (from === "bot" && !isError) {
      bubble.innerHTML = formatMessage(text);
    } else {
  bubble.textContent = text;
    }
  wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    scrollToBottom();
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const t = translations[currentLang];
  const userLabel = currentLang === 'tr' ? 'Kullanıcı' : 'User';
  const botLabel = currentLang === 'tr' ? 'Bot' : 'Bot';
  meta.textContent =
    (from === "user" ? userLabel : botLabel) + " • " + new Date().toLocaleTimeString(currentLang === 'tr' ? "tr-TR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  wrapper.appendChild(meta);
  
  // Animasyon için
  wrapper.style.opacity = "0";
  wrapper.style.transform = "translateY(10px)";
  setTimeout(() => {
    wrapper.style.transition = "all 0.3s ease";
    wrapper.style.opacity = "1";
    wrapper.style.transform = "translateY(0)";
  }, 10);
}

function scrollToBottom() {
  setTimeout(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }, 100);
}

// Typing effect fonksiyonu
function typeMessage(element, text, speed = 15) {
  const formattedText = formatMessage(text);
  
  // Orijinal metni karakter karakter işle (HTML formatlamadan önce)
  // Önce HTML formatlamasını yap, sonra karakter karakter göster
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = formattedText;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  element.innerHTML = '';
  const typingIndicator = document.createElement('span');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.textContent = '|';
  element.appendChild(typingIndicator);
  
  let i = 0;
  let currentText = '';
  let htmlIndex = 0;
  const htmlChars = formattedText.split('');
  
  function type() {
    if (i < plainText.length) {
      const char = plainText[i];
      
      // Boşlukları da hemen ekle
      if (char === ' ') {
        currentText += ' ';
      } else if (char === '\n' || char === '\r') {
        currentText += '\n';
      } else {
        currentText += char;
      }
      
      // HTML formatını koruyarak göster
      // Basit formatlamaları uygula
      let displayText = currentText
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Boşlukları koru
      displayText = displayText.replace(/  +/g, (match) => {
        return '&nbsp;'.repeat(match.length - 1) + ' ';
      });
      
      element.innerHTML = displayText + '<span class="typing-indicator">|</span>';
      
      // Scroll'u güncelle
      scrollToBottom();
      
      i++;
      
      // Boşluklarda da normal hızda devam et
      let delay = speed;
      if (char === '.' || char === '!' || char === '?') {
        delay = speed * 3; // Noktalama işaretlerinden sonra bekle
      } else if (char === '\n' || char === '\r') {
        delay = speed * 2; // Satır sonlarında biraz bekle
      } else if (char === ',') {
        delay = speed * 1.5; // Virgülden sonra kısa bekle
      }
      
      setTimeout(type, delay);
    } else {
      // Son olarak tam formatlanmış HTML'i ekle
      element.innerHTML = formattedText;
      scrollToBottom();
    }
  }
  
  type();
}

function formatMessage(text) {
  // Basit markdown formatı desteği
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Satır sonlarını koru ve düzgün işle
  formatted = formatted
    .replace(/\n\n+/g, '<br><br>') // Çift satır sonları
    .replace(/\n/g, '<br>') // Tek satır sonları
    .replace(/^•\s/gm, '• '); // Madde işaretleri
  
  // Boşlukları koru (birden fazla boşluk)
  formatted = formatted.replace(/  +/g, (match) => {
    return '&nbsp;'.repeat(match.length - 1) + ' ';
  });
  
  return formatted;
}

function addLoadingMessage() {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot loading";
  wrapper.id = "loading-message";
  
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
  wrapper.appendChild(bubble);
  
  // Loading mesajına meta ekleme (duplicate önlemek için)

  messagesEl.appendChild(wrapper);
  setTimeout(() => {
  messagesEl.scrollTop = messagesEl.scrollHeight;
  }, 100);
}

function removeLoadingMessage() {
  const loadingMsg = document.getElementById("loading-message");
  if (loadingMsg) {
    loadingMsg.remove();
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  
  if (isLoading) return;
  
  const question = input.value.trim();
  if (!question) return;

  // Kullanıcı mesajını ekle
  addMessage(question, "user");
  input.value = "";
  
  // Loading state
  isLoading = true;
  sendBtn.disabled = true;
  const t = translations[currentLang];
  sendBtn.textContent = t.sending;
  addLoadingMessage();

  const requestStartTime = Date.now();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    removeLoadingMessage();

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (data?.answer) {
      // İstatistikleri güncelle - opsiyonel, hata olursa sessizce atlanır
      try {
        const responseTime = Date.now() - requestStartTime;
        if (stats) {
          stats.lastResponse = data.answer;
          // updateStatsSafely varsa çağır, yoksa atla
          if (typeof updateStatsSafely === 'function') {
            updateStatsSafely(question, data.answer, responseTime);
          }
        }
      } catch (err) {
        // İstatistikler opsiyonel, hata olursa hiçbir şey yapma - sessizce atla
      }
      
      addMessage(data.answer, "bot", false, true); // Typing effect ile
    } else if (data?.error) {
      addMessage("Hata: " + data.error, "bot", true);
    } else {
      addMessage("Şu anda yanıt veremiyorum, lütfen daha sonra tekrar deneyin.", "bot", true);
    }
  } catch (err) {
    removeLoadingMessage();
    console.error("Error:", err);
    const errorMsg = err.message.includes("Failed to fetch") || err.message.includes("NetworkError")
      ? "Sunucuya ulaşılamadı. Backend'in çalıştığından emin olun (https://mert-cv-bot.onrender.com)."
      : "Bir hata oluştu: " + err.message;
    addMessage(errorMsg, "bot", true);
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    const t = translations[currentLang];
    sendBtn.textContent = t.send;
    // Input'a tekrar focus et
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}

// Form submit event
if (form) {
form.addEventListener("submit", handleSubmit);
}

// Enter tuşu ile gönder (Shift+Enter ile yeni satır)
if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });
}
