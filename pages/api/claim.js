export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address, token } = req.body;

  // ===== VERIFY CAPTCHA =====
  const captchaRes = await fetch(`https://hcaptcha.com/siteverify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
  }).then(r => r.json());

  if (!captchaRes.success) {
    return res.status(400).json({ success: false, message: "Captcha verification failed" });
  }

  // ===== SET FIXED PAYOUT =====
  const amount = 1; // contoh 50 satoshi DOGE
  const currency = "DOGE";

  try {
    const response = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        to: address,
        amount: amount.toString(),
        currency
      })
    });

    const data = await response.json();

    if (data.status === 200) {
      return res.json({ success: true, message: `Claim successful: ${amount} ${currency} sent!` });
    } else {
      return res.status(400).json({ success: false, message: data.message || "Claim failed" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}
