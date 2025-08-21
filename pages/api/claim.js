import fetch from "node-fetch";

const FAUCETPAY_API_KEY = process.env.FAUCETPAY_API_KEY;
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;

// cooldown memory (better pakai DB kalau skala besar)
let lastClaim = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { wallet, captcha } = req.body;
  if (!wallet || !captcha) {
    return res.json({ success: false, message: "Wallet & captcha required" });
  }

  // ✅ Verifikasi captcha
  const verify = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: HCAPTCHA_SECRET,
      response: captcha
    })
  });
  const captchaRes = await verify.json();

  if (!captchaRes.success) {
    return res.json({ success: false, message: "Captcha failed" });
  }

  // ✅ Cooldown 5 menit
  const now = Date.now();
  if (lastClaim[wallet] && now - lastClaim[wallet] < 5 * 60 * 1000) {
    return res.json({ success: false, message: "Wait 5 minutes before next claim" });
  }

  // ✅ FaucetPay API
  const fp = await fetch("https://faucetpay.io/api/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      api_key: FAUCETPAY_API_KEY,
      currency: "DOGE",
      amount: 0.0095,
      to: wallet
    })
  });

  const fpRes = await fp.json();
  if (fpRes.status === 200) {
    lastClaim[wallet] = now;
    return res.json({ success: true, message: fpRes.message });
  } else {
    return res.json({ success: false, message: fpRes.message || "FaucetPay error" });
  }
}
