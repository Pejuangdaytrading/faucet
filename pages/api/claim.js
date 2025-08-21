import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Konfigurasi faucet
const COIN = "DOGE";
const COOLDOWN_MINUTES = 5;
const REWARD = 0.01; // misal 0.01 DOGE per claim (setara hourly faucet dibagi 12x)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { wallet } = req.body;
  if (!wallet) {
    return res.status(400).json({ message: "Wallet tidak boleh kosong" });
  }

  // Cek history klaim user
  const { data: lastClaim, error: fetchErr } = await supabase
    .from("claims")
    .select("*")
    .eq("wallet", wallet)
    .eq("coin", COIN)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchErr) {
    console.error("Error fetch:", fetchErr.message);
  }

  // Cek cooldown
  if (lastClaim) {
    const diff = (Date.now() - new Date(lastClaim.created_at).getTime()) / 1000;
    if (diff < COOLDOWN_MINUTES * 60) {
      const remaining = Math.ceil(COOLDOWN_MINUTES * 60 - diff);
      return res.status(429).json({
        message: `⏳ Tunggu ${remaining} detik lagi untuk klaim berikutnya.`,
      });
    }
  }

  // Kirim reward (via FaucetPay API)
  try {
    const fpRes = await fetch("https://faucetpay.io/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: process.env.FAUCETPAY_API_KEY,
        currency: COIN,
        to: wallet,
        amount: REWARD.toString(),
      }),
    });

    const fpData = await fpRes.json();

    if (fpData.status !== 200) {
      return res.status(500).json({ message: "❌ Gagal mengirim reward." });
    }

    // Simpan log klaim ke Supabase
    const { error: insertErr } = await supabase.from("claims").insert([
      {
        wallet,
        coin: COIN,
        amount: REWARD,
      },
    ]);

    if (insertErr) {
      console.error("Insert error:", insertErr.message);
    }

    return res.status(200).json({
      message: `✅ Klaim sukses! Kamu dapat ${REWARD} ${COIN}.`,
    });
  } catch (err) {
    console.error("Catch error:", err.message);
    return res.status(500).json({ message: "❌ Error internal." });
  }
}
