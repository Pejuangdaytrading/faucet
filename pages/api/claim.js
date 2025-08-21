export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, token } = req.body;
  if (!address || !token) {
    return res.status(400).json({ success: false, message: "Missing address or captcha token" });
  }

  // Verifikasi hCaptcha
  const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.HCAPTCHA_SECRET,
      response: token
    })
  });
  const captchaData = await captchaRes.json();
  if (!captchaData.success) {
    return res.status(400).json({ success: false, message: "Captcha verification failed" });
  }

  // Random payout dalam satoshi Doge — kisaran 100–500
  const payoutSatoshi = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
  const currency = "DOGE";

  // Kirim ke FaucetPay
  try {
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        to: address,
        amount: payoutSatoshi.toString(),
        currency
      })
    });

    const fpData = await fpRes.json();
    console.log("FaucetPay Response:", fpData);

    if (fpData.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Claim successful: ${payoutSatoshi} ${currency} sent!`,
        amount: payoutSatoshi,
        currency
      });
    } else {
      return res.status(400).json({
        success: false,
        message: fpData.message || "FaucetPay error",
        detail: fpData
      });
    }
  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ success: false, message: "Server error", detail: err.message });
  }
}
