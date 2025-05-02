# OnProver Telegram Monitor Bot

Bot Telegram otomatis untuk memantau statistik akun pengguna dari platform OnProver menggunakan API GraphQL, dan mengirim laporan ke Telegram setiap jam serta mengingatkan jika totalProof tidak bertambah. Dibuat dengan Node.js, axios, dan node-telegram-bot-api.

## Fitur

- Kirim laporan User Info setiap 1 jam
- Notifikasi jika totalProof tidak berubah selama 30 menit
- Reminder harian untuk melakukan daily check-in
- Command Telegram /check untuk melihat laporan terkini
- Pesan awal saat bot dinyalakan

## Instalasi

### 1. Clone repo ini

```bash
git clone https://github.com/akbarabdul80/onprove-check.git
cd onprover-telegram-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file .env

Buat file `.env` di root folder dengan isi sebagai berikut:

```bash
TELEGRAM_TOKEN=isi_dengan_token_bot_telegrammu
TELEGRAM_CHAT_ID=isi_dengan_chat_id_telegrammu
BEARER_TOKEN=isi_dengan_bearer_token_OnProver
```

### 4. Jalankan bot

```bash
node index.js
```

## Struktur File

- index.js : Script utama yang menjalankan bot
- .env : File environment (jangan dibagikan)
- package.json : Daftar dependencies

## Catatan Tambahan

- Bot menggunakan polling untuk menerima command Telegram.
- Zona waktu jadwal disesuaikan ke Asia/Jakarta.
- Pastikan token dan chat ID valid agar bot bisa mengirim pesan ke Telegram.
