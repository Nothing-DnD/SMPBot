require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

// ===== EXPRESS =====
const app = express();

app.get('/', (req, res) => {
    res.send('Bot is alive');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

// ===== DISCORD =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;

const CHANNEL_ID = '1509520035197222953';

const SERVER_IP = '95.217.59.237';
const SERVER_PORT = 10900;

// ===== CACHE =====
let lastName = '';

// ===== READY =====
client.once('ready', () => {

    console.log(`✅ Logged in as ${client.user.tag}`);

    updateChannel();

    setInterval(updateChannel, 30000);
});

// ===== UPDATE CHANNEL =====
async function updateChannel() {

    try {

        const channel = await client.channels.fetch(CHANNEL_ID);

        if (!channel) return;

        const res = await bedrock.ping({
            host: SERVER_IP,
            port: SERVER_PORT
        });

        const players = res.playersOnline || 0;
        const max = res.playersMax || 0;

        const newName = `🟢 Online ${players}/${max}`;

        if (newName !== lastName) {

            await channel.setName(newName);

            lastName = newName;

            console.log(`✅ Updated: ${newName}`);
        }

    } catch (err) {

        console.log('⚠️ Server offline');

        try {

            const channel = await client.channels.fetch(CHANNEL_ID);

            const offlineName = '🔴 Offline';

            if (offlineName !== lastName) {

                await channel.setName(offlineName);

                lastName = offlineName;

                console.log('✅ Updated: Offline');
            }

        } catch {}

    }
}

// ===== LOGIN =====
client.login(TOKEN)
    .then(() => {
        console.log('✅ Discord connected');
    })
    .catch((err) => {
        console.log('❌ Login failed:', err.message);
    });
