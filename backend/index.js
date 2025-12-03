import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";
import fs from "fs-extra";

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client (lazy initialization)
let client = null;
if (process.env.OPENAI_API_KEY) {
  try {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } catch (err) {
    console.warn("OpenAI client initialization failed:", err.message);
  }
} else {
  console.warn("OPENAI_API_KEY not found in environment variables. /ask endpoint will not work.");
}

// Mert profilini yükle
const mertProfile = fs.readFileSync("./mert_profile.md", "utf8");

const SYSTEM_PROMPT = `
Sen Mert Açar'ın kişisel CV botusun.

Aşağıda Mert'in güncel ve kurumsal profili bulunuyor:
---
${mertProfile}
---

Kurallar:
- Her zaman profesyonel, net ve anlaşılır bir Türkçe ile cevap ver.
- Bilgileri abartmadan, gerçek ve kurumsal bir dille aktar.
- Önce kısa bir özet ver, ardından gerekiyorsa madde madde detay ekle.
- Mert'in güçlü yönlerini özellikle öğrenme hızı, baskı altında çalışma
  ve problem çözme becerisi etrafında vurgula.
- Mümkün oldukça cevapları pozisyon veya sorunun bağlamına göre özelleştir.
- İletişim bilgileri sorulduğunda veya uygun olduğunda Mert'in iletişim bilgilerini mutlaka ver:
  E-posta: mertacar011@gmail.com
  Telefon: 0553 751 84 33
- İletişim bilgilerini her zaman açık ve net bir şekilde paylaş.
`;

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Mert CV Bot backend running" });
});

app.get("/ask", (req, res) => {
  res.status(405).send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mert CV Bot API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-top: 0; }
        p { color: #666; line-height: 1.6; }
        .info {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        a {
          color: #2196F3;
          text-decoration: none;
        }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔌 Mert CV Bot API</h1>
        <p>Bu endpoint sadece <strong>POST</strong> isteklerini kabul eder.</p>
        
        <div class="info">
          <strong>Kullanım:</strong><br>
          <code>POST /ask</code><br><br>
          <strong>Request Body:</strong><br>
          <code>{ "question": "Mert'in backend tecrübesi nedir?" }</code>
        </div>
        
        <p>Frontend uygulamasını kullanmak için <a href="/">ana sayfaya</a> dönün veya <code>frontend/index.html</code> dosyasını tarayıcıda açın.</p>
      </div>
    </body>
    </html>
  `);
});

app.post("/ask", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in .env file." });
    }

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question alanı zorunludur." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error("API error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Sunucu tarafında bir hata oluştu." });
  }
});

const PORT = process.env.PORT || 3001;

try {
  app.listen(PORT, () => {
    console.log("Mert CV Bot backend running on port", PORT);
  }).on('error', (err) => {
    console.error("Server error:", err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
    }
    process.exit(1);
  });
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}