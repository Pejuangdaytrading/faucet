export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, "h-captcha-response": token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // 1. Verifikasi hCaptcha
  const captchaVerify = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`,
  });

  const captchaResult = await captchaVerify.json();

  if (!captchaResult.success) {
    return res.status(400).json({ error: "Captcha verification failed", detail: captchaResult });
  }

  // 2. Kirim Payment FaucetPay
  try {
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: "0.1"
      }),
    });

    const fpData = await fpRes.json();

    if (fpData.status === 200) {
      return res.status(200).json({ success: true, message: "✅ DOGE sent successfully!", faucetpay: fpData });
    } else {
      return res.status(400).json({ error: "FaucetPay Error", detail: fpData });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
