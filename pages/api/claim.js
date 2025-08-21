export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, token } = req.body;
  if (!address || !token) {
    return res.status(400).json({ success: false, message: "Missing address or captcha token" });
  }

  // 1. Verifikasi hCaptcha
  const hcRes = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
  });

  const hcData = await hcRes.json().catch(() => null);
  if (!hcData?.success) {
    return res.status(400).json({ success: false, message: "Captcha verification failed" });
  }

  // 2. Random payout (optional)
  const payout = (Math.floor(Math.random() * 100) + 1) / 10000000;

  // 3. FaucetPay API call
  const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `api_key=${process.env.FAUCETPAY_API_KEY}&currency=DOGE&to=${address}&amount=${payout}`
  });

  const fpData = await fpRes.json().catch(() => null);
  if (fpData?.status === 200) {
    return res.status(200).json({
      success: true,
      message: "DOGE sent! Check your wallet."
    });
  } else {
    return res.status(400).json({
      success: false,
      message: fpData?.message || "FaucetPay error"
    });
  }
}
