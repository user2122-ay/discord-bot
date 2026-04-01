require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
const { Pool } = require("pg");

// 🔹 Conexión a Postgres (opcional)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("✅ Conectado a Postgres"))
    .catch(err => console.log("⚠️ Postgres no conectado (no pasa nada si no usas DB)"));

// 🤖 Cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 🔥 SISTEMAS
require("./events/seguridad")(client);
require("./events/logs")(client); // 👈 AÑADIDO (NO ROMPE NADA)

client.commands = new Collection();

// 📂 Cargar comandos
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);

        if (typeof command === "object" && !command.data) {
            for (const key in command) {
                const cmd = command[key];
                if (cmd?.data?.name) {
                    client.commands.set(cmd.data.name, cmd);
                    console.log(`✅ Cargado: ${cmd.data.name}`);
                }
            }
        }

        else if (command?.data?.name) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Cargado: ${command.data.name}`);
        }

        else {
            console.log(`❌ ${file} no tiene estructura válida`);
        }

    } catch (err) {
        console.log(`❌ Error en ${file}:`, err.message);
    }
}

// 🆔 TU GUILD ID
const GUILD_ID = "1463192289974157334";

// 🚀 Cuando el bot prende
client.once("ready", async () => {
    console.log(`🔥 Bot conectado como ${client.user.tag}`);

    const commands = [];
    client.commands.forEach(cmd => {
        try {
            commands.push(cmd.data.toJSON());
        } catch (err) {
            console.log(`❌ Error en comando ${cmd.data?.name}:`, err.message);
        }
    });

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        console.log("⏳ Registrando comandos...");

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, GUILD_ID),
            { body: commands }
        );

        console.log(`✅ ${commands.length} comandos registrados`);
    } catch (error) {
        console.error("❌ Error registrando comandos:", error);
    }
});

// 🎯 Ejecutar comandos
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    interaction.pool = pool;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error en ${interaction.commandName}:`, error);

        const msg = "❌ Error ejecutando el comando";

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: msg, ephemeral: true });
        } else {
            await interaction.reply({ content: msg, ephemeral: true });
        }
    }
});

// 🔐 Login
client.login(process.env.TOKEN);
