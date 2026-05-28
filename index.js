require('dotenv').config();

const express = require('express');
const app = express();

const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

// ===== WEB SERVER FOR RENDER =====
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('SMP Bot is running');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

// ===== TOKEN =====
const TOKEN = process.env.TOKEN;

console.log('TOKEN EXISTS:', !!TOKEN);

if (!TOKEN) {
    console.log('❌ TOKEN not found');
    process.exit(1);
}

// ===== DISCORD CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== SETTINGS =====
const CHANNEL_ID = '1509520035197222953';
const SERVER_IP = '95.217.59.237';
const SERVER_PORT = 10900;

// ===== CACHE =====
let lastName = '';
let isUpdating = false;

// ===== READY =====
client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    updateServer();
    setInterval(updateServer, 30000);
});

// ===== ERROR HANDLERS =====
client.on('error', (err) => {
    console.log('❌ Discord error:', err.message);
});

client.on('shardError', (err) => {
    console.log('❌ Shard error:', err.message);
});

// ===== BEDROCK PING =====
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
        console.log('⚠️ Ping failed:', err.message);

        return {
            online: false,
            players: 0,
            max: 0
        };
    }
}

// ===== UPDATE CHANNEL =====
async function updateServer() {
    if (isUpdating) return;

    isUpdating = true;

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);

        if (!channel) {
            console.log('❌ Channel not found');
            return;
        }

        const data = await getServerData();

        const newName = data.online
            ? `🟢 Online ${data.players}/${data.max}`
            : `🔴 Offline`;

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

// ===== LOGIN =====
client.login(TOKEN)
    .then(() => {
        console.log('✅ Discord login successful');
    })
    .catch((err) => {
        console.log('❌ LOGIN FAILED:', err.message);
    });
