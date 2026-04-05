require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
const { Pool } = require("pg");

// 🔹 Conexión a Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("✅ Conectado a Postgres"))
    .catch(err => console.log("⚠️ Postgres no conectado:", err.message));

// 🤖 Cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ==============================
// 🔥 SISTEMAS
// ==============================

require("./events/seguridad")(client);
require("./events/logs")(client);
require("./events/bienvenida")(client);
require("./events/presence")(client);
require("./events/panelTickets")(client);

// ==============================
// 📦 COMANDOS
// ==============================

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);

        // 🧩 Para archivos con varios comandos
        if (typeof command === "object" && !command.data) {
            for (const key in command) {
                const cmd = command[key];
                if (cmd?.data?.name) {
                    client.commands.set(cmd.data.name, cmd);
                    console.log(`✅ Cargado: ${cmd.data.name}`);
                }
            }
        }

        // 🧩 Para archivos normales
        else if (command?.data?.name) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Cargado: ${command.data.name}`);
        }

        else {
            console.log(`❌ ${file} inválido`);
        }

    } catch (err) {
        console.log(`❌ Error en ${file}:`, err.message);
    }
}

// ==============================
// 🆔 GUILD
// ==============================

const GUILD_ID = "1463192289974157334";

// ==============================
// 🚀 READY
// ==============================

client.once("ready", async () => {
    console.log(`🔥 Bot conectado como ${client.user.tag}`);

    const commands = [];

    client.commands.forEach(cmd => {
        try {
            commands.push(cmd.data.toJSON());
        } catch (err) {
            console.log(`❌ Error en ${cmd.data?.name}`);
        }
    });

    // 🔍 DEBUG
    console.log("📦 Comandos que se enviarán:");
    commands.forEach(cmd => console.log(`➡️ ${cmd.name}`));

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

// ==============================
// 🎯 INTERACCIONES
// ==============================

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

// 🔐 LOGIN
client.login(process.env.TOKEN);
