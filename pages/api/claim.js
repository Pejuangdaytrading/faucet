import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { address, captchaToken } = req.body;

  if (!address) {
    return res.status(400).json({ success: false, message: "Wallet address required" });
  }

  try {
    // 1. Verify hCaptcha
    const captchaVerify = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: captchaToken,
      }),
    });

    const captchaResult = await captchaVerify.json();
    if (!captchaResult.success) {
      return res.status(400).json({ success: false, message: "Captcha failed" });
    }

    // 2. Call FaucetPay API
    const fpResponse = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.FAUCETPAY_API_KEY,
        amount: 0.1,              // 👉 nominal reward (misal 0.1 DOGE)
        currency: "DOGE",
        to: address,
      }),
    });

    const fpData = await fpResponse.json();

    if (fpData.status === 200) {
      return res.json({
        success: true,
        message: "✅ Claim berhasil dikirim",
        tx: fpData,
      });
    } else {
      return res.json({
        success: false,
        message: fpData.message || "FaucetPay error",
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
