import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN || "8042004025:AAEVVhjmp5u9MUfHUwIoYPiglS3GMT0Aaig";
const WEBAPP_URL = "https://faucet.dailyfunhub.site";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const update = req.body;
  console.log("Incoming update:", JSON.stringify(update, null, 2));

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || "";

    if (text === "/start") {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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

      const result = await r.json();
      console.log("Telegram response:", result);
    }
  }

  return res.status(200).json({ ok: true });
}
