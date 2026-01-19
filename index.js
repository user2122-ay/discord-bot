const Discord = require('discord.js');
const client = new Discord.Client({ intents: [32767] });

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.channel.send('🏓 Pong!');
  }
});

client.login(process.env.TOKEN);
