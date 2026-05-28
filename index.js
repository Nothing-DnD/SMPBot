require('dotenv').config();

const express = require('express');
const app = express();

const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

// ===== WEB SERVER =====
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
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

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('error', (err) => {
    console.log('❌ Discord error:', err);
});

client.on('shardError', (err) => {
    console.log('❌ Shard error:', err);
});

// ===== LOGIN =====
client.login(TOKEN)
    .then(() => {
        console.log('✅ Login successful');
    })
    .catch((err) => {
        console.log('❌ LOGIN FAILED:', err.message);
    });
