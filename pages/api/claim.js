export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ error: "Missing address or captcha token" });
  }

  try {
    // 1. Verify hCaptcha
    const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // 2. Send faucet payment via FaucetPay
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `api_key=${process.env.FAUCETPAY_API_KEY}&currency=DOGE&amount=0.5&to=${address}`
    });

    const fpData = await fpRes.json();
    if (fpData.status === 200) {
      return res.json({ success: true, payout: fpData.payout });
    } else {
      return res.status(400).json({ error: fpData.message });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
