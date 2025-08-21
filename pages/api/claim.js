const adsterraDirect = "https://www.profitableratecpm.com/qabjgu4pry?key=b3ddcd458c98b1640797a768bc984772";
let lastClaimTime = 0;

document.getElementById("claimBtn").addEventListener("click", async () => {
  const wallet = document.getElementById("wallet").value.trim();
  const now = Date.now();

  // cek wallet
  if (!wallet) {
    document.getElementById("result").innerText = "⚠️ Masukkan alamat wallet FaucetPay DOGE!";
    return;
  }

  // cek cooldown 5 menit
  if (now - lastClaimTime < 5 * 60 * 1000) {
    const remaining = Math.ceil((5 * 60 * 1000 - (now - lastClaimTime)) / 1000);
    document.getElementById("result").innerText = `⏳ Tunggu ${remaining} detik lagi sebelum claim berikutnya.`;
    return;
  }

  // 1. Buka Adsterra Direct Link
  window.open(adsterraDirect, "_blank");

  // 2. Trigger Monetag SDK ads
  if (typeof show_9748411 !== "undefined") {
    show_9748411();
  }

  // 3. Delay biar iklan tampil
  setTimeout(async () => {
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, coin: "DOGE" })
      });

      const data = await res.json();
      document.getElementById("result").innerText = data.message || "✅ Claim sukses!";
      lastClaimTime = Date.now();
    } catch (err) {
      document.getElementById("result").innerText = "❌ Error claim. Coba lagi.";
    }
  }, 5000); // tunggu 5 detik
});
