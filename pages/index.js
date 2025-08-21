import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>DailyFunHub Faucet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Monetag SDK */}
        <script src="//libtl.com/sdk.js" data-zone="9748411" data-sdk="show_9748411"></script>
        {/* Adsterra Social Bar */}
        <script type="text/javascript" src="//pl27468110.profitableratecpm.com/a6/68/b0/a668b013958e55610215c3779c508f5e.js"></script>
        {/* Telegram Mini Apps SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>

      <main style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "30px" }}>
        <h1>🚀 DailyFunHub Faucet</h1>
        <p>Claim free <b>DOGE</b> every 5 minutes! 🔥</p>

        <input
          id="wallet"
          placeholder="Enter your FaucetPay wallet address"
          style={{ padding: "10px", width: "80%", marginBottom: "10px" }}
        />
        <br />

        <button
          onClick={() => {
            const wallet = document.getElementById("wallet").value;
            fetch("/api/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wallet })
            })
              .then(res => res.json())
              .then(data => alert(data.message || "Claim Success!"))
              .catch(() => alert("⚠️ Claim failed. Try again."));
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          💰 Claim Faucet
        </button>

        <br /><br />

        <a
          href="https://faucetpay.io/?r=37006"
          target="_blank"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          🔐 Create FaucetPay Wallet
        </a>
      </main>
    </>
  );
}
