module.exports = (client) => {

const LOG_CHANNEL_ID = "1463192293312958628";

// 🔎 Función para sacar quién hizo la acción
async function getExecutor(guild, type) {
    const logs = await guild.fetchAuditLogs({ limit: 1, type }).catch(() => null);
    if (!logs) return null;
    return logs.entries.first()?.executor || null;
}

// 🟢 CAMBIO DE ROLES / APODO
client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const channel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
    const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

    const executor = await getExecutor(newMember.guild, 25); // MEMBER_ROLE_UPDATE

    // ➕ Roles añadidos
    if (addedRoles.size > 0) {
        addedRoles.forEach(role => {
            channel.send({
                embeds: [{
                    title: "➕ Rol añadido",
                    color: 0x2ecc71,
                    fields: [
                        { name: "👤 Usuario", value: `<@${newMember.id}>`, inline: true },
                        { name: "🏷️ Rol", value: role.name, inline: true },
                        { name: "🛡️ Responsable", value: executor ? executor.tag : "Desconocido", inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        });
    }

    // ➖ Roles quitados
    if (removedRoles.size > 0) {
        removedRoles.forEach(role => {
            channel.send({
                embeds: [{
                    title: "➖ Rol removido",
                    color: 0xe74c3c,
                    fields: [
                        { name: "👤 Usuario", value: `<@${newMember.id}>`, inline: true },
                        { name: "🏷️ Rol", value: role.name, inline: true },
                        { name: "🛡️ Responsable", value: executor ? executor.tag : "Desconocido", inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        });
    }

    // ✏️ Cambio de apodo
    if (oldMember.nickname !== newMember.nickname) {
        const executorNick = await getExecutor(newMember.guild, 24); // MEMBER_UPDATE

        channel.send({
            embeds: [{
                title: "✏️ Cambio de apodo",
                color: 0xf1c40f,
                fields: [
                    { name: "👤 Usuario", value: `<@${newMember.id}>`, inline: true },
                    { name: "📌 Antes", value: oldMember.nickname || "Sin apodo", inline: true },
                    { name: "📌 Después", value: newMember.nickname || "Sin apodo", inline: true },
                    { name: "🛡️ Responsable", value: executorNick ? executorNick.tag : "Desconocido", inline: true }
                ],
                timestamp: new Date()
            }]
        });
    }
});

// 🔴 BAN
client.on("guildBanAdd", async (ban) => {
    const channel = ban.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const executor = await getExecutor(ban.guild, 22);

    channel.send({
        embeds: [{
            title: "🔨 Usuario baneado",
            color: 0x992d22,
            fields: [
                { name: "👤 Usuario", value: `<@${ban.user.id}>`, inline: true },
                { name: "🛡️ Responsable", value: executor ? executor.tag : "Desconocido", inline: true }
            ],
            timestamp: new Date()
        }]
    });
});

// 🟠 KICK
client.on("guildMemberRemove", async (member) => {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const executor = await getExecutor(member.guild, 20);

    channel.send({
        embeds: [{
            title: "👢 Usuario expulsado",
            color: 0xe67e22,
            fields: [
                { name: "👤 Usuario", value: `<@${member.id}>`, inline: true },
                { name: "🛡️ Responsable", value: executor ? executor.tag : "Desconocido", inline: true }
            ],
            timestamp: new Date()
        }]
    });
});

// 🟢 ENTRADA DE USUARIO (ANTI RAID LOG)
client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    channel.send({
        embeds: [{
            title: "🟢 Usuario entró",
            color: 0x57f287,
            fields: [
                { name: "👤 Usuario", value: `<@${member.id}>`, inline: true },
                { name: "📅 Cuenta creada", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            ],
            timestamp: new Date()
        }]
    });
});

};
