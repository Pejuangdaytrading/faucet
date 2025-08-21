// /api/claim.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { address, token } = req.body;

    // Verifikasi hCaptcha
    const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
    });
    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return res.status(400).json({ success: false, message: "Captcha verification failed" });
    }

    // Random amount antara 0.00000050 DOGE (50 satoshi) - 0.00000500 DOGE (500 satoshi)
const min = 0.00000050;
const max = 0.00000500;
const amount = (Math.random() * (max - min) + min).toFixed(8); // 8 desimal wajib

// kirim ke FaucetPay
const response = await fetch("https://faucetpay.io/api/v1/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: process.env.FAUCETPAY_API_KEY,
    currency: "DOGE",
    to: address,
    amount: amount,
  }),
});

    const fpData = await fpRes.json();

    if (fpData.status === 200) {
      return res.status(200).json({
        success: true,
        message: "Claim successful",
        amount: amountToSend,
        currency: "DOGE"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: fpData.message || "FaucetPay error"
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
