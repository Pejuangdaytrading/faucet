// pages/api/bot.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;

    if (body.message && body.message.text === "/start") {
      const chatId = body.message.chat.id;

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚀 Klik tombol di bawah untuk buka Faucet MiniApp",
          reply_markup: {
            keyboard: [
              [
                {
                  text: "💎 Open Faucet",
                  web_app: {
                    url: "https://faucet.dailyfunhub.site"
                  }
                }
              ]
            ],
            resize_keyboard: true
          }
        }),
      });
    }

    res.status(200).send("ok");
  } else {
    res.status(200).json({ status: "running" });
  }
}
