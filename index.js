require('dotenv').config();

const express = require('express');
const app = express();

const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

// ====== KEEP RENDER ALIVE (FIX WEB SERVICE WARNING) ======
app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🌐 Web server started');
});

// ====== TOKEN ======
const TOKEN = process.env.TOKEN;

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

// ====== BOT READY ======
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    updateServer();
    setInterval(updateServer, 30000);
});

// ====== GET SERVER STATUS ======
async function getServerData() {
    try {
        const res = await bedrock.ping({
            host: SERVER_IP,
            port: SERVER_PORT
        });

        return {
            online: true,
            players: res.playersOnline || 0,
            max: res.playersMax || 0
        };

    } catch (e) {
        return {
            online: false,
            players: 0,
            max: 0
        };
    }
}

// ====== UPDATE CHANNEL ======
async function updateServer() {
    try {
        const data = await getServerData();

        const channel = await client.channels.fetch(CHANNEL_ID);

        if (!channel) {
            console.log('❌ Channel not found');
            return;
        }

        let newName;

        if (data.online) {
            newName = `🟢 Online: ${data.players}/${data.max}`;
        } else {
            newName = `🔴 Server Offline`;
        }

        // ====== ANTI-SPAM ======
        if (newName !== lastName) {
            await channel.setName(newName);
            lastName = newName;

            console.log(`✅ Updated channel: ${newName}`);
        }

    } catch (err) {
        console.log('❌ Error updating server:', err.message);
    }
}

// ====== START BOT ======
if (!TOKEN) {
    console.log('❌ TOKEN not found in .env');
    process.exit(1);
}

client.login(TOKEN);
client.login(TOKEN);
