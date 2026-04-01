module.exports = (client) => {

const LOG_CHANNEL_ID = "1463192293312958628";

// 🔎 Función para sacar quién hizo la acción
async function getExecutor(guild, type) {
    const logs = await guild.fetchAuditLogs({ limit: 1, type }).catch(() => null);
    if (!logs) return null;
    return logs.entries.first()?.executor || null;
}

// ==============================
// 👤 MIEMBROS
// ==============================

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const channel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
    const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

    const executor = await getExecutor(newMember.guild, 25);

    // ➕ Rol añadido
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

    // ➖ Rol quitado
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

    // ✏️ Apodo
    if (oldMember.nickname !== newMember.nickname) {
        const executorNick = await getExecutor(newMember.guild, 24);

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

// ==============================
// 🔨 BAN / KICK / JOIN
// ==============================

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

// ==============================
// 🏷️ ROLES (🔥 NUEVO)
// ==============================

// ✏️ Editar rol
client.on("roleUpdate", async (oldRole, newRole) => {
    const channel = newRole.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const executor = await getExecutor(newRole.guild, 31);

    // Nombre
    if (oldRole.name !== newRole.name) {
        channel.send({
            embeds: [{
                title: "✏️ Rol renombrado",
                color: 0xf1c40f,
                fields: [
                    { name: "🏷️ Rol", value: `<@&${newRole.id}>`, inline: true },
                    { name: "Antes", value: oldRole.name, inline: true },
                    { name: "Después", value: newRole.name, inline: true },
                    { name: "🛡️ Responsable", value: executor?.tag || "Desconocido", inline: true }
                ],
                timestamp: new Date()
            }]
        });
    }

    // Permisos peligrosos
    if (!oldRole.permissions.has("Administrator") && newRole.permissions.has("Administrator")) {
        channel.send({
            embeds: [{
                title: "🚨 ALERTA: ADMIN otorgado",
                color: 0xff0000,
                fields: [
                    { name: "🏷️ Rol", value: newRole.name, inline: true },
                    { name: "🛡️ Responsable", value: executor?.tag || "Desconocido", inline: true }
                ],
                timestamp: new Date()
            }]
        });
    }
});

// ➕ Crear rol
client.on("roleCreate", async (role) => {
    const channel = role.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const executor = await getExecutor(role.guild, 30);

    channel.send({
        embeds: [{
            title: "➕ Rol creado",
            color: 0x2ecc71,
            fields: [
                { name: "🏷️ Nombre", value: role.name, inline: true },
                { name: "🛡️ Responsable", value: executor?.tag || "Desconocido", inline: true }
            ],
            timestamp: new Date()
        }]
    });
});

// ❌ Eliminar rol
client.on("roleDelete", async (role) => {
    const channel = role.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const executor = await getExecutor(role.guild, 32);

    channel.send({
        embeds: [{
            title: "❌ Rol eliminado",
            color: 0xe74c3c,
            fields: [
                { name: "🏷️ Nombre", value: role.name, inline: true },
                { name: "🛡️ Responsable", value: executor?.tag || "Desconocido", inline: true }
            ],
            timestamp: new Date()
        }]
    });
});

};
