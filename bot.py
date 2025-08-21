import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
import requests
import random
import time

# === KONFIGURASI ===
TELEGRAM_TOKEN = "8042004025:AAEVVhjmp5u9MUfHUwIoYPiglS3GMT0Aaig"
FAUCETPAY_API_KEY = "ab06c7d3a505d0b7fb12d0fb39d828a40b1a2faed885a0ad467cd79683b0159d"
FAUCETPAY_CURRENCY = "DOGE"   # Bisa DOGE, BTC, LTC, TRX, USDT
MIN_REWARD = 1    # minimal reward per klaim
MAX_REWARD = 5    # maksimal reward per klaim
COOLDOWN = 600    # 10 menit cooldown (600 detik)

# === GLOBAL STORAGE ===
user_wallets = {}
user_last_claim = {}

# === START BOT ===
logging.basicConfig(level=logging.INFO)
bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher(bot)

# === KIRIM REWARD KE FAUCETPAY ===
def send_to_faucetpay(wallet, amount):
    url = "https://faucetpay.io/api/v1/send"
    payload = {
        "api_key": FAUCETPAY_API_KEY,
        "currency": FAUCETPAY_CURRENCY,
        "amount": amount,
        "to": wallet
    }
    r = requests.post(url, data=payload)
    return r.json()

# === COMMAND /start ===
@dp.message_handler(commands=['start'])
async def start_cmd(message: types.Message):
    await message.reply(
        "👋 Selamat datang di *DailyFunHub Faucet Bot*!\n\n"
        "⚡ Gunakan /setwallet <alamat_wallet>\n"
        "💰 Gunakan /claim untuk klaim reward\n"
        "📊 Gunakan /balance untuk cek saldo FaucetPay",
        parse_mode="Markdown"
    )

# === COMMAND /setwallet ===
@dp.message_handler(commands=['setwallet'])
async def set_wallet(message: types.Message):
    parts = message.text.split()
    if len(parts) != 2:
        await message.reply("⚠️ Format salah. Gunakan:\n`/setwallet ALAMAT_WALLET`", parse_mode="Markdown")
        return
    wallet = parts[1]
    user_wallets[message.from_user.id] = wallet
    await message.reply(f"✅ Wallet kamu diset ke:\n`{wallet}`", parse_mode="Markdown")

# === COMMAND /claim ===
@dp.message_handler(commands=['claim'])
async def claim_cmd(message: types.Message):
    user_id = message.from_user.id

    # cek wallet
    if user_id not in user_wallets:
        await message.reply("⚠️ Kamu belum set wallet.\nGunakan `/setwallet ALAMAT_WALLET`", parse_mode="Markdown")
        return

    # cek cooldown
    now = time.time()
    if user_id in user_last_claim and now - user_last_claim[user_id] < COOLDOWN:
        sisa = int(COOLDOWN - (now - user_last_claim[user_id]))
        await message.reply(f"⏳ Tunggu {sisa} detik sebelum klaim lagi.")
        return

    # random reward
    reward = random.randint(MIN_REWARD, MAX_REWARD)
    wallet = user_wallets[user_id]

    # kirim ke FaucetPay
    result = send_to_faucetpay(wallet, reward)
    if result.get("status") == 200:
        user_last_claim[user_id] = now
        await message.reply(f"🎉 Kamu dapat {reward} {FAUCETPAY_CURRENCY} ke wallet `{wallet}`", parse_mode="Markdown")
    else:
        await message.reply(f"❌ Gagal klaim:\n{result}")

# === COMMAND /balance ===
@dp.message_handler(commands=['balance'])
async def balance_cmd(message: types.Message):
    url = "https://faucetpay.io/api/v1/balance"
    payload = {"api_key": FAUCETPAY_API_KEY, "currency": FAUCETPAY_CURRENCY}
    r = requests.post(url, data=payload).json()
    await message.reply(f"💰 Saldo FaucetPay:\n{r}")

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
