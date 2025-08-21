// claim.js
const fetch = require("node-fetch");

async function verifyCaptcha(token) {
  try {
    const params = new URLSearchParams();
    params.append("response", token);
    params.append("secret", process.env.HCAPTCHA_SECRET);

    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const data = await res.json();
    console.log("hCaptcha verify:", data);

    return data.success;
  } catch (err) {
    console.error("Captcha verify error:", err);
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ success: false, message: "Missing address or captcha token" });
  }

  // ✅ Verify hCaptcha
  const isHuman = await verifyCaptcha(token);
  if (!isHuman) {
    return res.status(400).json({ success: false, message: "Captcha verification failed" });
  }

  try {
    // ✅ Random payout range (contoh 0.00000050 – 0.00000200 DOGE)
    const min = 0.00000050;
    const max = 0.00000200;
    const amount = (Math.random() * (max - min) + min).toFixed(8);

    // ✅ FaucetPay API
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        to: address,
        amount: amount
      })
    });

    const data = await fpRes.json();
    console.log("FaucetPay Response:", data);

    if (data.status === 200) {
      return res.status(200).json({
        success: true,
        message: `Claim successful: ${amount} DOGE sent!`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.message || "FaucetPay error"
      });
    }
  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
