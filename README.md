# Faucet MiniApp 🚰

Faucet site with:
- Monetag & Adsterra ads
- hCaptcha verification
- FaucetPay direct payment

## Deploy
1. Fork repo → push ke GitHub
2. Deploy ke Vercel
3. Tambahkan **Environment Variables** di Vercel:
   - `FAUCETPAY_API_KEY` → API key faucetpay
   - `HCAPTCHA_SECRET` → secret key dari hCaptcha
4. Edit `index.html` → ganti `YOUR_HCAPTCHA_SITE_KEY` dengan site key kamu
