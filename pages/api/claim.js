export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { address, token } = req.body;
    if (!address || !token) {
      return res.status(400).json({ success: false, message: "Address or captcha token missing" });
    }

    // 🔹 Verify hCaptcha
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
    });

    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
    }

    // 🔹 Random payout (example DOGE)
    const payout = (Math.floor(Math.random() * (200 - 1 + 1)) + 1).toString(); 
    const currency = "DOGE";

    // 🔹 Send payment via FaucetPay
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `api_key=${process.env.FAUCETPAY_API_KEY}&to=${address}&amount=${payout}&currency=${currency}`
    });

    const fpData = await fpRes.json();

    if (fpData && fpData.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Claim successful: ${payout} ${currency} sent!`,
        payout,
        currency
      });
    } else {
      return res.status(400).json({
        success: false,
        message: fpData?.message || "FaucetPay error"
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
