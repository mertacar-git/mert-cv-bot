# Mert CV Bot

Bu proje, Mert Açar için hazırlanmış modern, interaktif bir CV botudur.
Frontend GitHub Pages üzerinde, backend ise Render/Railway gibi bir platformda
çalışacak şekilde tasarlanmıştır.

## Klasör Yapısı

- `backend/`
  - Node.js + Express tabanlı API
  - OpenAI Chat Completions entegrasyonu
  - `mert_profile.md` içinde Mert'in kurumsal profili
- `frontend/`
  - Modern, responsive chat arayüzü
  - `assets/styles.css` ve `assets/app.js`

## Backend Çalıştırma (Local)

```bash
cd backend
cp .env.example .env
# .env dosyasında OPENAI_API_KEY değerini doldurun
npm install
npm start
```

API varsayılan olarak `http://localhost:3000/ask` adresinde çalışır.

## Frontend Bağlantısı

`frontend/assets/app.js` dosyasındaki:

```js
const API_URL = "http://localhost:3000/ask";
```

satırı local için uygundur.

Deploy sonrası Render/Railway URL'iniz ile güncelleyin, örneğin:

```js
const API_URL = "https://mert-cv-bot-api.onrender.com/ask";
```

GitHub Pages için repo ayarlarında `frontend` klasörünü kaynak olarak seçmeniz yeterlidir.