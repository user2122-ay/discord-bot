require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");

// ⬇️ IMPORTANTE: handler de verificación
const verificacionHandler = require("./interactions/verificacionHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers // 🔑 necesario para roles y nick
  ]
});

// Collection para comandos
client.commands = new Collection();

// Cargar comandos
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ID del servidor
const GUILD_ID = "1463192289974157334";

// Registrar comandos
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = [];
  client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

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

// INTERACCIONES
client.on("interactionCreate", async interaction => {

  // 🔹 Comandos slash
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Error ejecutando el comando",
          ephemeral: true
        });
      }
    }
  }

  // 🔹 BOTONES + MODALES DE VERIFICACIÓN
  try {
    await verificacionHandler(interaction);
  } catch (err) {
    console.error("❌ Error en verificación:", err);
  }
});

// Login
client.login(process.env.TOKEN);
