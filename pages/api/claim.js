import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Atur reward DOGE per klaim
const REWARD_AMOUNT = 0.1; // contoh: 0.1 DOGE
const COOLDOWN_MINUTES = 5; 
const REFERRAL_BONUS = 0.1; // 10%

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { wallet } = req.body;
  if (!wallet) {
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    // 1. Cek klaim terakhir
    const { data: lastClaim, error: claimError } = await supabase
      .from("claims")
      .select("created_at")
      .eq("wallet", wallet)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (claimError && claimError.code !== "PGRST116") {
      throw claimError;
    }

    if (lastClaim) {
      const lastClaimTime = new Date(lastClaim.created_at);
      const now = new Date();
      const diffMinutes = (now - lastClaimTime) / 1000 / 60;

      if (diffMinutes < COOLDOWN_MINUTES) {
        return res.status(429).json({
          error: `Cooldown aktif. Coba lagi dalam ${Math.ceil(
            COOLDOWN_MINUTES - diffMinutes
          )} menit.`,
        });
      }
    }

    // 2. Insert klaim baru
    const { data: newClaim, error: insertError } = await supabase
      .from("claims")
      .insert([{ wallet, coin: "DOGE", amount: REWARD_AMOUNT }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Update saldo user
    await supabase.rpc("increment_balance", { 
      p_wallet: wallet, 
      p_amount: REWARD_AMOUNT 
    });

    // 4. Cek referral → beri bonus ke referrer
    const { data: referral } = await supabase
      .from("referrals")
      .select("referrer_wallet")
      .eq("user_wallet", wallet)
      .single();

    if (referral && referral.referrer_wallet) {
      const bonusAmount = REWARD_AMOUNT * REFERRAL_BONUS;
      await supabase.rpc("increment_balance", { 
        p_wallet: referral.referrer_wallet, 
        p_amount: bonusAmount 
      });
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil klaim ${REWARD_AMOUNT} DOGE`,
      claim: newClaim,
    });

  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
