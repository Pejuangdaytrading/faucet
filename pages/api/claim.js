// pages/api/claim.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { chatId } = req.body;

      // kirim pesan "Processing..."
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "⏳ Processing claim...",
        }),
      });

      // contoh proses claim
      // bisa ditambah request ke server faucet di sini
      await new Promise(resolve => setTimeout(resolve, 2000));

      // balasan sukses
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ Claim berhasil! DOGE sudah dikirim.",
        }),
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Claim error:", err);
      res.status(500).json({ error: "Claim failed" });
    }
  } else {
    res.status(200).json({ status: "claim api running" });
  }
}
