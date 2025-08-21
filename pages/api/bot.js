export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;

    // pastikan ada message dari Telegram
    if (body.message && body.message.text === "/start") {
      const chatId = body.message.chat.id;

      // balas pakai API Telegram
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🚀 Open Faucet",
          reply_markup: {
            keyboard: [[{ text: "💎 Open Faucet" }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        })
      });
    }

    res.status(200).send("ok");
  } else {
    res.status(200).json({ status: "running" });
  }
}
