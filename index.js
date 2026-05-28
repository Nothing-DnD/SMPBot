require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

// ====== TOKEN ======
const TOKEN = process.env.TOKEN;

// ====== SAFETY CHECK ======
if (!TOKEN) {
    console.log('❌ TOKEN not found in environment variables');
    process.exit(1);
}

// ====== DISCORD CLIENT ======
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ====== SETTINGS ======
const CHANNEL_ID = '1509520035197222953';
const SERVER_IP = '95.217.59.237';
const SERVER_PORT = 10900;

// ====== CACHE ======
let lastName = '';
let isUpdating = false;

// ====== READY ======
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    updateServer();
    setInterval(updateServer, 30000);
});

// ====== BEDROCK PING ======
async function getServerData() {
    try {
        const res = await bedrock.ping({
            host: SERVER_IP,
            port: SERVER_PORT
        });

        return {
            online: true,
            players: res.playersOnline ?? 0,
            max: res.playersMax ?? 0
        };

    } catch (err) {
        return {
            online: false,
            players: 0,
            max: 0
        };
    }
}

// ====== UPDATE CHANNEL NAME ======
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

        let newName;

        if (data.online) {
            newName = `🟢 Online ${data.players}/${data.max}`;
        } else {
            newName = `🔴 Offline`;
        }

        if (newName !== lastName) {
            await channel.setName(newName);
            lastName = newName;

            console.log(`✅ Updated: ${newName}`);
        }

    } catch (err) {
        console.log('❌ Update error:', err.message);
    } finally {
        isUpdating = false;
    }
}

// ====== LOGIN ======
client.login(TOKEN);
