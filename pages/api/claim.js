export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { address, "h-captcha-response": token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Missing captcha token" });
  }

  // Verifikasi ke hCaptcha
  const verify = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`,
  });

  const data = await verify.json();

  if (!data.success) {
    return res.status(400).json({ error: "Captcha verification failed" });
  }

  // TODO: lanjut proses FaucetPay payout
  return res.status(200).json({ success: true, message: "Captcha verified, payment pending..." });
}
