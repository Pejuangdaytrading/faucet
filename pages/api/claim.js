import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { wallet, amount } = req.body;
  if (!wallet || !amount) {
    return res.status(400).json({ error: "Wallet and amount required" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // cek klaim terakhir dari IP / wallet
  const { data: lastClaims } = await supabase
    .from("claims")
    .select("*")
    .or(`wallet.eq.${wallet},ip.eq.${ip}`)
    .order("created_at", { ascending: false })
    .limit(1);

  const cooldown = 10 * 60 * 1000; // 10 menit
  if (lastClaims && lastClaims.length > 0) {
    const lastClaim = new Date(lastClaims[0].created_at).getTime();
    if (Date.now() - lastClaim < cooldown) {
      const sisa = Math.ceil((cooldown - (Date.now() - lastClaim)) / 1000);
      return res.status(429).json({ error: `Tunggu ${sisa} detik sebelum klaim lagi.` });
    }
  }

  try {
    // kirim ke faucetpay
    const response = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: "DOGE",
        amount: amount,
        to: wallet
      })
    });

    const data = await response.json();

    // simpan log ke supabase kalau sukses
    if (data.status === 200) {
      await supabase.from("claims").insert([{ wallet, ip }]);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
