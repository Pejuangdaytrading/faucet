export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { wallet, amount } = req.body;
  if (!wallet || !amount) {
    return res.status(400).json({ error: "Wallet and amount required" });
  }

  try {
    const response = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY, // simpan di Environment Variable Vercel
        currency: "DOGE",                       // bisa diganti BTC, LTC, USDT dll
        amount: amount,
        to: wallet
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
