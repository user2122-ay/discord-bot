require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📦 Collection de comandos
client.commands = new Collection();

// 📂 Cargar comandos
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // 🔥 Si el archivo exporta varios comandos (array)
  if (Array.isArray(command)) {
    for (const cmd of command) {
      if (cmd?.data?.name) {
        client.commands.set(cmd.data.name, cmd);
      }
    }
  } 
  // 🔥 Si exporta un solo comando
  else {
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
    }
  }
}

// 🆔 ID del servidor
const GUILD_ID = "1471525858291355936";

// 🚀 Ready + registro de comandos
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = client.commands.map(cmd => cmd.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados correctamente");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

// 🎯 Interacciones (SOLO SLASH COMMANDS)
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Error ejecutando comando:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Error ejecutando el comando",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Error ejecutando el comando",
        ephemeral: true
      });
    }
  }
});

// 🔐 Login
client.login(process.env.TOKEN);
