// pages/api/claim.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, captchaToken } = req.body;

  if (!address || !captchaToken) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  try {
    // 1. Verify hCaptcha
    const captchaVerify = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.HCAPTCHA_SECRET}&response=${captchaToken}`,
    });

    const captchaResult = await captchaVerify.json();

    if (!captchaResult.success) {
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
    }

    // 2. FaucetPay API payout
    const payoutResponse = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        amount: "0.000967", // jumlah DOGE per claim (atur sesuai saldo)
        to: address,
        currency: "DOGE",
      }),
    });

    const payoutData = await payoutResponse.json();

    if (payoutData.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Payment sent! TX ID: ${payoutData.transactionId || "Check FaucetPay Dashboard"}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: payoutData.message || "FaucetPay error",
      });
    }
  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
