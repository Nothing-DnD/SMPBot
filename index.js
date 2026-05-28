require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.log('❌ TOKEN not found');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ====== SETTINGS ======
const CHANNEL_ID = '1509520035197222953';
const SERVER_IP = '95.217.59.237';
const SERVER_PORT = 10900;

// ====== STATE ======
let lastName = '';
let isUpdating = false;
let failCount = 0;
let interval;

// ====== READY ======
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    startLoop();
});

// ====== LOOP START ======
function startLoop() {
    if (interval) clearInterval(interval);

    interval = setInterval(async () => {
        await updateServer();
    }, 30000);

    updateServer();
}

// ====== SAFE PING WITH TIMEOUT ======
function pingWithTimeout() {
    return Promise.race([
        bedrock.ping({
            host: SERVER_IP,
            port: SERVER_PORT
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
        )
    ]);
}

// ====== GET SERVER DATA ======
async function getServerData() {
    try {
        const res = await pingWithTimeout();

        failCount = 0;

        return {
            online: true,
            players: res.playersOnline ?? 0,
            max: res.playersMax ?? 0
        };

    } catch (err) {
        failCount++;

        console.log(`⚠️ Ping failed (${failCount}/5):`, err.message);

        return {
            online: false,
            players: 0,
            max: 0
        };
    }
}

// ====== WATCHDOG (AUTO RESTART LOGIC) ======
function checkHealth() {
    if (failCount >= 5) {
        console.log('💥 Server lag detected -> restarting bot...');
        process.exit(1); // Render will auto-restart
    }
}

// ====== UPDATE CHANNEL ======
async function updateServer() {
    if (isUpdating) return;
    isUpdating = true;

    try {
        const data = await getServerData();

        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);

        if (!channel) {
            console.log('❌ Channel not found');
            return;
        }

        let newName = data.online
            ? `🟢 Online ${data.players}/${data.max}`
            : `🔴 Offline`;

        if (newName !== lastName) {
            await channel.setName(newName);
            lastName = newName;

            console.log(`✅ Updated: ${newName}`);
        }

        checkHealth();

    } catch (err) {
        console.log('❌ Update error:', err.message);
    } finally {
        isUpdating = false;
    }
}

// ====== LOGIN ======
client.login(TOKEN);
