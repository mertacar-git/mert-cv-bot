# Mert CV Bot

Mert CV Bot, Mert Açar'ın deneyimlerini, projelerini, teknik yetkinliklerini ve iletişim bilgilerini sohbet arayüzü üzerinden aktaran interaktif bir CV asistanıdır.  
Frontend statik olarak yayınlanır, backend ise OpenAI API ile dinamik yanıt üretir.

## Öne Çıkan Özellikler

- Modern ve responsive sohbet arayüzü
- Türkçe / İngilizce dil desteği
- Açık / koyu tema desteği
- Hızlı soru butonları
- Konuşmayı dışa aktarma (TXT)
- Web Speech API ile sesli soru sorabilme
- Text-to-Speech ile son yanıtı sesli dinleme
- Oturum istatistikleri (soru sayısı, yanıt süresi, konu dağılımı)
- QR kod ile sayfayı mobilde hızlı açma

## Proje Yapısı

```text
mert-cv-bot/
├─ index.html              # Ana arayüz
├─ assets/
│  ├─ app.js               # Frontend davranışları + API çağrıları
│  ├─ styles.css           # Arayüz stilleri
│  └─ ...                  # Görsel/PDF varlıkları
└─ backend/
   ├─ index.js             # Express API
   ├─ package.json
   └─ mert_profile.md      # Botun referans aldığı profil metni
```

## Teknolojiler

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Web Speech API (SpeechRecognition + SpeechSynthesis)

### Backend
- Node.js
- Express.js
- OpenAI Node SDK
- CORS
- dotenv

## Lokal Kurulum

### 1) Repoyu klonla

```bash
git clone https://github.com/mertacar-git/mert-cv-bot.git
cd mert-cv-bot
```

### 2) Backend bağımlılıklarını yükle

```bash
cd backend
npm install
```

### 3) Ortam değişkenlerini ayarla

`backend` klasöründe `.env` dosyası oluştur:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

> Not: `PORT` verilmezse backend varsayılan olarak `3001` portunda çalışır.

### 4) Backend'i başlat

```bash
npm start
```

### 5) Frontend'i çalıştır

Proje kökünde `index.html` dosyasını tarayıcıda açabilir veya bir statik sunucu ile yayınlayabilirsin.

## API Bilgisi

Backend endpoint'i:

- `GET /` -> Sağlık kontrolü
- `GET /ask` -> Sadece bilgilendirici HTML döner (POST kullanılmalı)
- `POST /ask` -> Soruyu işler ve yanıt döner

Örnek istek:

```bash
curl -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"Mert'in backend tecrübesini özetler misin?\"}"
```

Örnek yanıt:

```json
{
  "answer": "..."
}
```

## Frontend-Backend Bağlantısı

`assets/app.js` içindeki API adresi:

```js
const API_URL = "https://mert-cv-bot.onrender.com/ask";
```

Lokal geliştirme için bunu aşağıdaki gibi değiştirebilirsin:

```js
const API_URL = "http://localhost:3001/ask";
```

## Deployment

### Frontend (GitHub Pages)

1. Repo ayarlarında **Pages** bölümüne gir.
2. Branch olarak `main` seç.
3. Root (`/`) klasöründen yayınla.
4. Birkaç dakika içinde frontend URL'in aktif olur.

### Backend (Render / Railway)

1. `backend` klasörünü servis olarak deploy et.
2. Build komutu: `npm install`
3. Start komutu: `npm start`
4. Environment Variable olarak `OPENAI_API_KEY` ekle.
5. Deploy sonrası verilen backend URL'ini `assets/app.js` içindeki `API_URL` ile güncelle.

## Özelleştirme

- Botun cevap içeriği ve kişisel referansları için `backend/mert_profile.md` dosyasını güncelle.
- Sistem davranış kurallarını değiştirmek için `backend/index.js` içindeki `SYSTEM_PROMPT` metnini düzenle.
- Arayüz renkleri/yerleşimi için `assets/styles.css` dosyasını güncelle.
- Karşılama metni ve çoklu dil içerikleri için `assets/app.js` içindeki `translations` objesini düzenle.

## Sık Karşılaşılan Sorunlar

- **`OpenAI API key is not configured`**  
  `.env` içinde `OPENAI_API_KEY` tanımlı değil.

- **`Failed to fetch` / ağ hatası**  
  Frontend'in işaret ettiği `API_URL` ile backend servisinin URL'i uyuşmuyor veya backend ayakta değil.

- **Port kullanımda (`EADDRINUSE`)**  
  Aynı portu kullanan başka bir süreç var. `PORT` değerini değiştir.

- **Sesli giriş çalışmıyor**  
  Tarayıcı mikrofon izni verilmemiş olabilir. İzinleri kontrol et ve HTTPS ortamında test et.

## Lisans

Bu proje kişisel portföy/CV amaçlı geliştirilmiştir. Açık kaynak lisans tercihi eklenecekse bu bölümü güncelleyebilirsin.