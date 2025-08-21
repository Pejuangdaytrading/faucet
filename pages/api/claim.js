export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ success: false, message: "Missing address or captcha token" });
  }

  try {
    // ✅ Verify hCaptcha
    const hcaptchaResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: token
      })
    });

    const hcaptchaData = await hcaptchaResponse.json();
    if (!hcaptchaData.success) {
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
    }

    // ✅ FaucetPay API
    const faucetResponse = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: "0.0001" // contoh
      })
    });

    const result = await faucetResponse.json();
    console.log("🔍 FaucetPay API Response:", result); // <--- cek di Vercel log

    // ✅ Tangkap sukses
    if (result.status === 200) {
      const amount = result.amount || result.payout || result.sentAmount || "0.1";
      const currency = result.currency || "DOGE";
      const message = result.message || "Claim successful";

      return res.status(200).json({
        success: true,
        message: `✅ ${message}: ${amount} ${currency} sent!`
      });
    }

    // ❌ Tangkap gagal (tampilkan pesan asli)
    return res.status(400).json({
      success: false,
      message: result.message || "FaucetPay error"
    });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
