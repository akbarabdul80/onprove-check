import 'dotenv/config';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import schedule from 'node-schedule';

// Load environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

// Setup Telegram bot (polling mode)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

let lastTotalProof = null;

// Function untuk fetch data dari API
async function fetchUserInfo() {
  try {
    const response = await axios.post('https://onprover-api.orochi.network/graphql', {
      operationName: "UserInfo",
      variables: {},
      query: `query UserInfo {
        userInfo {
          uuid
          username
          email
          address
          userLevel
          hasOwnedNFT
          totalReward
          totalProving
          totalProof
          totalReferring
          totalReferralReward
          totalOnClaim
          rewardBalance
          lastDailyClaim
          __typename
        }
      }`
    }, {
      headers: {
        'accept': '*/*',
        'authorization': `Bearer ${BEARER_TOKEN}`,
        'content-type': 'application/json',
        'origin': 'https://onprover.orochi.network',
        'referer': 'https://onprover.orochi.network/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      }
    });

    return response.data.data.userInfo;
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    return null;
  }
}

// Format user info ke format Telegram
function formatUserInfo(userInfo) {
  const formatNumber = (num) => {
    if (!num) return '0.00';
    return parseFloat(num).toFixed(2);
  };

  return `🧾 *User Info Report*\n
📈 Total Reward: ${formatNumber(userInfo.totalReward)} $ORC
📈 Total Proving: ${formatNumber(userInfo.totalProving)} $ORC
🔢 Total Proof: ${userInfo.totalProof}
🤝 Total Referring: ${userInfo.totalReferring}
💸 Total Referral Reward: ${formatNumber(userInfo.totalReferralReward)} $ORC
🧾 Total On Claim: ${formatNumber(userInfo.totalOnClaim)} $ORC
🎯 Reward Balance: ${formatNumber(userInfo.rewardBalance)} $ORC
🕐 Last Daily Claim: ${formatNumber(userInfo.lastDailyClaim)} $ORC
`;
}

// Function untuk kirim pesan ke Telegram
async function sendTelegramMessage(text) {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
  }
}

// Jadwal: Report tiap 1 jam
schedule.scheduleJob('0 * * * *', async () => {
  const userInfo = await fetchUserInfo();
  if (userInfo) {
    const message = formatUserInfo(userInfo);
    await sendTelegramMessage(message);
  }
});

// Jadwal: Cek totalProof tiap 30 menit
schedule.scheduleJob('*/30 * * * *', async () => {
  const userInfo = await fetchUserInfo();
  if (userInfo) {
    if (lastTotalProof !== null && userInfo.totalProof === lastTotalProof) {
      await sendTelegramMessage('⚠️ *ALERT!* Total Proof tidak bertambah dalam 30 menit terakhir!');
    }
    lastTotalProof = userInfo.totalProof;
  }
});

// Jadwal: Reminder daily checkin jam 1 siang (WIB = UTC+7)
schedule.scheduleJob('0 6 * * *', { timezone: 'Asia/Jakarta' }, async () => {
  await sendTelegramMessage('🌞 *Reminder:* Waktunya daily check-in di OnProver! 🚀');
});

// Listen Command /check
bot.onText(/\/check/, async (msg) => {
  const chatId = msg.chat.id;
  const userInfo = await fetchUserInfo();
  if (userInfo) {
    const message = formatUserInfo(userInfo);
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, '❗ Error fetching user info.');
  }
});

// Saat bot baru jalan
console.log('Bot is running...');
await sendTelegramMessage('🛡 Bot is running and monitoring...');

const initialUserInfo = await fetchUserInfo();
if (initialUserInfo) {
  const message = formatUserInfo(initialUserInfo);
  await sendTelegramMessage(message);
}
