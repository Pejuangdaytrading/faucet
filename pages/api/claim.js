export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, token } = req.body;

    if (!address || !token) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // ✅ Verify hCaptcha
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // ✅ Random payment
    const min = 50;   // satoshi DOGE
    const max = 200;  // satoshi DOGE
    const amount = (Math.floor(Math.random() * (max - min + 1)) + min) / 100000000;

    // ✅ FaucetPay API call
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `api_key=${process.env.FAUCETPAY_API_KEY}&currency=DOGE&amount=${amount}&to=${address}`,
    });

    const fpData = await fpRes.json();

    if (fpData.status === 200) {
      return res.status(200).json({
        success: true,
        amount: amount,
        currency: "DOGE",
        message: `Claim successful: ${amount} DOGE sent!`
      });
    } else {
      return res.status(400).json({ error: fpData.message || "FaucetPay error" });
    }

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
