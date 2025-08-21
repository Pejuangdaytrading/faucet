export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, token } = req.body;
  if (!address || !token) {
    return res.status(400).json({ success: false, message: "Missing address or captcha token" });
  }

  // Verifikasi hCaptcha
  const params = new URLSearchParams({
    response: token,
    secret: process.env.HCAPTCHA_SECRET
  });

  const hcaptchaRes = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const hcaptchaData = await hcaptchaRes.json().catch(() => null);

  if (!hcaptchaData || !hcaptchaData.success) {
    return res.status(400).json({ success: false, message: "Captcha verification failed" });
  }

  // Random payout antara 50–100 satoshi (integer)
  const payout = (Math.floor(Math.random() * (100 - 50 + 1)) + 50).toString();
  const currency = "DOGE";

  // Kirim payment ke FaucetPay
  const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      api_key: process.env.FAUCETPAY_API_KEY,
      to: address,
      currency: currency,
      amount: payout
    })
  });

  const fpData = await fpRes.json().catch(() => null);

  if (fpData && fpData.status === 200) {
    // Format pesan sukses dengan payout yang pasti tidak undefined
    return res.status(200).json({
      success: true,
      message: `Claim successful: ${payout} ${currency} sent!`
    });
  } else {
    return res.status(400).json({
      success: false,
      message: fpData?.message || "FaucetPay error"
    });
  }
}
