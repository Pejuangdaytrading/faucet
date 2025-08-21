import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Faucet config
const REWARD = 0.0025; // DOGE per claim
const COIN = "DOGE";
const COOLDOWN_MINUTES = 5;

export default async function handler(req, res) {
  console.log("📩 Incoming request:", req.method, req.body);

  if (req.method !== "POST") {
    console.warn("⚠️ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { wallet } = req.body || {};
  if (!wallet) {
    console.warn("⚠️ Missing wallet in request");
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    // Check last claim
    const { data: lastClaim, error: lastErr } = await supabase
      .from("claims")
      .select("created_at")
      .eq("wallet", wallet)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastErr && lastErr.code !== "PGRST116") {
      console.error("❌ Supabase select error:", lastErr.message);
      throw lastErr;
    }

    if (lastClaim) {
      const lastTime = new Date(lastClaim.created_at);
      const diffMinutes = (Date.now() - lastTime.getTime()) / (1000 * 60);

      if (diffMinutes < COOLDOWN_MINUTES) {
        console.log(`⏳ Cooldown active for wallet ${wallet}`);
        return res.status(429).json({
          error: `Cooldown active. Wait ${Math.ceil(
            COOLDOWN_MINUTES - diffMinutes
          )} minutes.`,
        });
      }
    }

    // Insert new claim
    const { error: insertErr } = await supabase.from("claims").insert([
      {
        wallet,
        coin: COIN,
        amount: REWARD,
      },
    ]);
    if (insertErr) {
      console.error("❌ Insert claim error:", insertErr.message);
      throw insertErr;
    }

    // Update balance
    const { data: existing, error: balErr } = await supabase
      .from("balances")
      .select("balance")
      .eq("wallet", wallet)
      .single();

    if (balErr && balErr.code !== "PGRST116") {
      console.error("❌ Balance select error:", balErr.message);
      throw balErr;
    }

    if (existing) {
      const newBalance = existing.balance + REWARD;
      const { error: updErr } = await supabase
        .from("balances")
        .update({ balance: newBalance })
        .eq("wallet", wallet);
      if (updErr) {
        console.error("❌ Balance update error:", updErr.message);
        throw updErr;
      }
    } else {
      const { error: insBalErr } = await supabase
        .from("balances")
        .insert([{ wallet, balance: REWARD }]);
      if (insBalErr) {
        console.error("❌ Balance insert error:", insBalErr.message);
        throw insBalErr;
      }
    }

    console.log(`✅ Claim success for ${wallet}: +${REWARD} ${COIN}`);

    return res.status(200).json({
      success: true,
      wallet,
      coin: COIN,
      amount: REWARD,
      message: `✅ Successfully claimed ${REWARD} ${COIN}`,
    });
  } catch (err) {
    console.error("🔥 Unexpected error:", err.message || err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message || String(err),
    });
  }
}
