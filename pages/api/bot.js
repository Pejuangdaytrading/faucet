import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// pakai ENV di vercel untuk keamanan
const BOT_TOKEN = process.env.BOT_TOKEN || "8042004025:AAEVVhjmp5u9MUfHUwIoYPiglS3GMT0Aaig";
const WEBAPP_URL = "https://faucet.dailyfunhub.site";

app.post("/api/bot", async (req, res) => {
  const update = req.body;

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || "";

    if (text === "/start") {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚰 Selamat datang di DailyFunHub Faucet!\n\nKlik tombol di bawah untuk mulai klaim gratis DOGE ⛏️",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💎 Open Faucet", web_app: { url: WEBAPP_URL } }]
            ]
          }
        })
      });
    }
  }

  res.sendStatus(200);
});

export default app;
