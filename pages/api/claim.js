export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ error: "Missing address or captcha token" });
  }

  try {
    // ✅ Verify captcha
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`,
    });

    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // ✅ Send faucet payment via FaucetPay API
    const payoutRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: 0.00001, // Test kecil dulu
      }),
    });

    const payoutData = await payoutRes.json();

    if (payoutData.status === 200) {
      return res.status(200).json({ success: true, message: "Payment sent!" });
    } else {
      return res.status(500).json({ error: payoutData.message || "Payment failed" });
    }

  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
