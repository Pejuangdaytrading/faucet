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

    // ✅ Call FaucetPay API
    const faucetResponse = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: "0.0001" // contoh, nanti bisa di-randomize sesuai kebutuhan
      })
    });

    const result = await faucetResponse.json();
    console.log("FaucetPay Response:", result); // ✅ debug log ke Vercel

    if (result.status === 200) {
      const amount = result.amount || result.payout || result.value || "0";
      const currency = result.currency || "DOGE";

      return res.status(200).json({
        success: true,
        message: `✅ Claim successful: ${amount} ${currency} sent!`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || "FaucetPay error"
      });
    }
  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
