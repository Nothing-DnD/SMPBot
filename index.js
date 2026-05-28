reguire('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const bedrock = require('bedrock-protocol');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ====== НАСТРОЙКИ ======
const CHANNEL_ID = '1509520035197222953';
const SERVER_IP = '95.217.59.237';
const SERVER_PORT = 10900;

// ====== КЕШ (чтобы не спамить API) ======
let lastName = '';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    updateServer();
    setInterval(updateServer, 30000); // каждые 30 сек
});

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

async function updateServer() {
    try {
        const data = await getServerData();

        const channel = await client.channels.fetch(CHANNEL_ID);

        let newName;

        if (data.online) {
            newName = `🟢 Online: ${data.players}/${data.max}`;
        } else {
            newName = `🔴 Server Offline`;
        }

        // защита от лишних обновлений
        if (newName !== lastName) {
            await channel.setName(newName);
            lastName = newName;
            console.log('Updated:', newName);
        }

    } catch (err) {
        console.log('Error updating server:', err.message);
    }
}

client.login(TOKEN);