require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Collection para los comandos
client.commands = new Collection();

// Cargar todos los comandos de la carpeta commands
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ID de tu servidor
const GUILD_ID = "1463192289974157334";

// Registrar todos los comandos slash al iniciar
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = [];
  client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log("✅ Comandos registrados correctamente");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

// Interacciones
client.on("interactionCreate", async interaction => {
  // Comando slash
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Error ejecutando el comando", ephemeral: true });
    }
  }

  // Modal submit (si algún comando usa modal)
  if (interaction.isModalSubmit()) {
    // Se maneja dentro del comando correspondiente
    const command = client.commands.get(interaction.customId?.split("_")[0]); 
    // Ejemplo: modalID = "creardni_modal", toma "creardni"
    if (command && command.modalSubmit) {
      try {
        await command.modalSubmit(interaction);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Error procesando el modal", ephemeral: true });
      }
    }
  }
});

// Conectar el bot
client.login(process.env.TOKEN);
