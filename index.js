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
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.DirectMessages
    ], 
    partials: ["CHANNEL"]
});

// ==============================
// 🔥 SISTEMAS
// ==============================

require("./events/seguridad")(client);
require("./events/logs")(client);
require("./events/bienvenida")(client);
require("./events/presence")(client);
require("./events/mencionBot")(client);
require("./events/tickets")(client); 
require("./events/afk")(client);

// ==============================
// 📦 COMANDOS
// ==============================

client.commands = new Collection();

// 🔥 FUNCIÓN NUEVA (LEE CARPETAS)
function getAllCommands(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = `${dir}/${file}`;
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllCommands(filePath));
        } else if (file.endsWith(".js")) {
            results.push(filePath);
        }
    });

    return results;
}

const commandFiles = getAllCommands("./commands");

// 🔥 CARGADOR (mínimo cambio)
for (const file of commandFiles) {
    try {
        const command = require(file);

        // 🧩 Archivos con varios comandos
        if (typeof command === "object" && !command.data) {
            for (const key in command) {
                const cmd = command[key];
                if (cmd?.data?.name) {
                    client.commands.set(cmd.data.name, cmd);
                    console.log(`✅ Cargado: ${cmd.data.name}`);
                }
            }
        }

        // 🧩 Archivos normales
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

const GUILD_ID = "1345956472986796183";

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
