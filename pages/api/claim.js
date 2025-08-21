export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  try {
    // Verifikasi hCaptcha
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
    });

    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(400).json({ success: false, error: "Captcha verification failed" });
    }

    // Kirim ke FaucetPay API
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: (Math.floor(Math.random() * 100) + 1) / 100000000, // random kecil
      }),
    });

    const fpData = await fpRes.json();

    if (fpData.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Claim successful: ${fpData.amount} ${fpData.currency} sent!`,
        amount: fpData.amount,
        currency: fpData.currency
      });
    } else {
      return res.status(400).json({ success: false, error: fpData.message || "FaucetPay error" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
