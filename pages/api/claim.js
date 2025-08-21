import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Konfigurasi reward faucet
const REWARD = 0.0025; // DOGE per klaim
const COIN = "DOGE";
const COOLDOWN_MINUTES = 5;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    // Cek klaim terakhir
    const { data: lastClaim, error: claimErr } = await supabase
      .from("claims")
      .select("created_at")
      .eq("wallet", wallet)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (claimErr && claimErr.code !== "PGRST116") {
      throw claimErr;
    }

    if (lastClaim) {
      const lastTime = new Date(lastClaim.created_at);
      const diffMinutes = (Date.now() - lastTime.getTime()) / (1000 * 60);

      if (diffMinutes < COOLDOWN_MINUTES) {
        return res.status(429).json({
          error: `Cooldown aktif. Tunggu ${Math.ceil(
            COOLDOWN_MINUTES - diffMinutes
          )} menit lagi.`,
        });
      }
    }

    // Simpan klaim baru
    const { error: insertErr } = await supabase.from("claims").insert([
      {
        wallet,
        coin: COIN,
        amount: REWARD,
      },
    ]);

    if (insertErr) throw insertErr;

    // Update balance
    const { data: existingBalance } = await supabase
      .from("balances")
      .select("balance")
      .eq("wallet", wallet)
      .single();

    if (existingBalance) {
      await supabase
        .from("balances")
        .update({ balance: existingBalance.balance + REWARD })
        .eq("wallet", wallet);
    } else {
      await supabase.from("balances").insert([{ wallet, balance: REWARD }]);
    }

    return res.status(200).json({
      success: true,
      wallet,
      coin: COIN,
      amount: REWARD,
      message: `Berhasil klaim ${REWARD} ${COIN}!`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
