import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Enable button after 8s
    const timer = setTimeout(() => setDisabled(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = async () => {
    if (!wallet) {
      alert("⚠️ Please enter your FaucetPay wallet address!");
      return;
    }

    // 🔥 Open Adsterra Direct Link
    window.open(
      "https://www.profitableratecpm.com/qabjgu4pry?key=b3ddcd458c98b1640797a768bc984772",
      "_blank"
    );

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("⚠️ Claim failed. Try again later.");
    }
  };

  return (
    <>
      <Head>
        <title>DailyFunHub Faucet</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script src="//libtl.com/sdk.js" data-zone="9748411" data-sdk="show_9748411"></script>
        <script type="text/javascript" src="//pl27468110.profitableratecpm.com/a6/68/b0/a668b013958e55610215c3779c508f5e.js"></script>
      </Head>
      <div style={styles.container}>
        <h1 style={styles.title}>🚰 DailyFunHub Faucet</h1>
        <p style={styles.desc}>
          Claim free <b>DOGE</b> every <b>5 minutes</b>.<br />
          Get faster rewards than normal faucets ⏱️
        </p>

        <input
          type="text"
          placeholder="Enter your FaucetPay wallet address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          style={styles.input}
        />

        <div style={styles.ads}>
          🔒 Please wait until the ad loads before claiming...
        </div>

        <button
          onClick={handleClaim}
          disabled={disabled}
          style={disabled ? styles.buttonDisabled : styles.button}
        >
          Claim Now
        </button>

        {message && <p style={{ marginTop: "15px" }}>{message}</p>}

        <div style={styles.note}>
          Don’t have a FaucetPay wallet? 👉{" "}
          <a href="https://faucetpay.io/?r=37006" target="_blank">
            Create one here
          </a>
        </div>
      </div>
    </>
  );
}

// 🎨 Inline CSS
const styles = {
  container: {
    maxWidth: "420px",
    margin: "auto",
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    fontFamily: "Segoe UI, Arial, sans-serif",
    textAlign: "center",
  },
  title: { color: "#1a73e8", marginBottom: "8px" },
  desc: { fontSize: "14px", color: "#555", marginBottom: "20px", lineHeight: 1.4 },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#1a73e8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonDisabled: {
    width: "100%",
    padding: "14px",
    background: "#bbb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "not-allowed",
  },
  note: { marginTop: "15px", fontSize: "13px", color: "#444" },
  ads: { margin: "20px 0", fontSize: "13px", color: "#666" },
};
