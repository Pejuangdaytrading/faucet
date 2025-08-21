export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { address, hcaptchaToken } = req.body;

    if (!address) {
      return res.status(400).json({ success: false, message: "Wallet address is required" });
    }

    // ✅ Verifikasi hCaptcha
    const hcaptchaVerify = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: hcaptchaToken,
      }),
    });

    const hcaptchaData = await hcaptchaVerify.json();

    if (!hcaptchaData.success) {
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
    }

    // ✅ Random amount 50 – 500 satoshi DOGE
    const min = 0.00000050;
    const max = 0.00000500;
    const amount = (Math.random() * (max - min) + min).toFixed(8); // 8 decimal

    // ✅ Kirim ke FaucetPay
    const fpResponse = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: amount,
      }),
    });

    const result = await fpResponse.json();

    if (result.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Claim successful: ${amount} DOGE sent!`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || "FaucetPay error",
      });
    }
  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
