export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, token } = req.body;

  if (!address || !token) {
    return res.status(400).json({ error: "Missing address or captcha token" });
  }

  try {
    // Verifikasi ke hCaptcha
    const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET, // ini harus pakai Secret Key
        response: token,
      }),
    });

    const verifyData = await verifyRes.json();
    console.log("HCaptcha verify response:", verifyData); // debug di Vercel logs

    if (!verifyData.success) {
      return res.status(400).json({
        error: "Captcha verification failed",
        detail: verifyData, // biar kelihatan detail error di response
      });
    }

    // --- Lanjutkan ke FaucetPay atau distribusi real claim ---
    // TODO: panggil API FaucetPay di sini
    return res.status(200).json({ success: true, message: "Claim successful" });

  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
