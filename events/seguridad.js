module.exports = (client) => {

const LOG_CHANNEL_ID = "1463192293312958628";

// 📊 Mapas de control
const spamMensajes = new Map();
const spamPings = new Map();
const canalSpam = new Map();

// 🎨 EMBED
function crearEmbed({ guild, titulo, color, user, fields, categoria }) {
    return {
        author: {
            name: `${categoria} • ${guild.name}`,
            icon_url: guild.iconURL({ dynamic: true })
        },
        title: titulo,
        color: color,
        thumbnail: user ? { url: user.displayAvatarURL({ dynamic: true }) } : null,
        fields: fields,
        footer: {
            text: user ? user.tag : "Sistema de Seguridad",
            icon_url: user ? user.displayAvatarURL({ dynamic: true }) : guild.iconURL()
        },
        timestamp: new Date()
    };
}

// ==============================
// 🚨 ANTI SPAM MENSAJES
// ==============================

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const log = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!log) return;

    const now = Date.now();
    let data = spamMensajes.get(message.author.id) || { count: 0, last: now };

    if (now - data.last < 5000) data.count++;
    else data.count = 1;

    data.last = now;
    spamMensajes.set(message.author.id, data);

    // ⚠️ Advertencia
    if (data.count === 5) {
        message.reply("⚠️ Evita hacer spam.");
    }

    // 🚨 Sanción
    if (data.count >= 8) {
        await message.member.timeout(60000).catch(() => {});

        log.send({
            embeds: [crearEmbed({
                guild: message.guild,
                titulo: "🚨 Spam detectado",
                color: 0xff0000,
                user: message.author,
                categoria: "🚨 ANTI-SPAM",
                fields: [
                    { name: "Usuario", value: `<@${message.author.id}>`, inline: true },
                    { name: "Acción", value: "Mute 1 minuto", inline: true }
                ]
            })]
        });
    }
});

// ==============================
// 📣 ANTI SPAM PINGS
// ==============================

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.mentions.users.size === 0) return;

    const log = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!log) return;

    const now = Date.now();
    let data = spamPings.get(message.author.id) || { count: 0, last: now };

    if (now - data.last < 5000) data.count++;
    else data.count = 1;

    data.last = now;
    spamPings.set(message.author.id, data);

    // 🚨 Demasiados pings
    if (message.mentions.users.size >= 5 || data.count >= 5) {
        await message.member.timeout(120000).catch(() => {});

        log.send({
            embeds: [crearEmbed({
                guild: message.guild,
                titulo: "📣 Spam de menciones",
                color: 0xff0000,
                user: message.author,
                categoria: "🚨 ANTI-PING",
                fields: [
                    { name: "Usuario", value: `<@${message.author.id}>`, inline: true },
                    { name: "Acción", value: "Mute 2 minutos", inline: true }
                ]
            })]
        });
    }
});

// ==============================
// 🚨 ANTI RAID (CANALES)
// ==============================

client.on("channelCreate", async (channel) => {
    const guild = channel.guild;
    const log = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!log) return;

    const now = Date.now();
    let data = canalSpam.get(guild.id) || { count: 0, last: now };

    if (now - data.last < 60000) data.count++;
    else data.count = 1;

    data.last = now;
    canalSpam.set(guild.id, data);

    const logs = await guild.fetchAuditLogs({ limit: 1, type: 10 }).catch(() => null);
    const executor = logs?.entries.first()?.executor;

    // ⚠️ Alerta
    if (data.count >= 2) {
        log.send({
            embeds: [crearEmbed({
                guild,
                titulo: "⚠️ Posible raid de canales",
                color: 0xff9900,
                user: executor,
                categoria: "🚨 ANTI-RAID",
                fields: [
                    { name: "Usuario", value: executor?.tag || "Desconocido", inline: true },
                    { name: "Canales creados", value: `${data.count} en 1 minuto`, inline: true }
                ]
            })]
        });
    }

    // 🚨 Raid confirmado
    if (data.count >= 4 && executor) {
        await guild.members.ban(executor.id).catch(() => {});

        log.send({
            embeds: [crearEmbed({
                guild,
                titulo: "🚨 RAID DETECTADO",
                color: 0xff0000,
                user: executor,
                categoria: "🚨 ANTI-RAID",
                fields: [
                    { name: "Usuario", value: executor.tag, inline: true },
                    { name: "Acción", value: "Ban automático", inline: true }
                ]
            })]
        });
    }
});

};
