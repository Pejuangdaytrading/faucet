export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, "h-captcha-response": hcaptchaToken } = req.body;

    if (!address || !hcaptchaToken) {
      return res.status(400).json({ error: "Missing address or captcha" });
    }

    // 1. Verify hCaptcha
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET;
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: hcaptchaSecret,
        response: hcaptchaToken,
      }),
    });
    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return res.status(400).json({ error: "Captcha verification failed", detail: captchaData });
    }

    // 2. Send payment via FaucetPay API
    const apiKey = process.env.FAUCETPAY_API_KEY;
    const payoutRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: apiKey,
        currency: "DOGE",
        to: address,
        amount: "0.5", // test kecil dulu
      }),
    });

    const payoutData = await payoutRes.json();

    if (payoutData.status === 200) {
      return res.json({ success: true, message: `Sent 0.5 DOGE to ${address}` });
    } else {
      return res.status(400).json({ error: "Payment failed", detail: payoutData });
    }

  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
