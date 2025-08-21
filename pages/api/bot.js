export default async function handler(req, res) {
  if (req.method === "POST") {
    const update = req.body;

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === "/start") {
        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "💎 Open Faucet",
            reply_markup: {
              inline_keyboard: [[
                { text: "💎 Open Faucet", url: process.env.WEBAPP_URL }
              ]]
            }
          })
        });
      }
    }

    res.status(200).json({ ok: true });
  } else {
    res.status(200).json({ status: "Bot API running" });
  }
}
