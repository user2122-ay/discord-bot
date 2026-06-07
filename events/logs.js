const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
  AuditLogEvent
} = require("discord.js");

module.exports = (client) => {

  const LOG_CHANNEL_ID = "1455970934535225518";

  // 🔎 Obtener ejecutor del audit log
  async function getExecutor(guild, type, targetId = null) {
    try {
      const logs = await guild.fetchAuditLogs({ limit: 5, type });
      const entry = targetId
        ? logs.entries.find(e => e.target?.id === targetId)
        : logs.entries.first();
      if (!entry) return null;
      // Solo válido si es reciente (menos de 5s)
      if (Date.now() - entry.createdTimestamp > 5000) return null;
      return entry.executor || null;
    } catch { return null; }
  }

  // 🧱 Crear cajón de log
  function log({ color, titulo, subtitulo, fields, avatarUrl, guild }) {
    const container = new ContainerBuilder()
      .setAccentColor(color);

    if (avatarUrl) {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${titulo}\n` +
              (subtitulo ? `-# ${subtitulo}` : `-# ${guild?.name ?? ""}`)
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(avatarUrl)
          )
      );
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${titulo}\n` +
          (subtitulo ? `-# ${subtitulo}` : `-# ${guild?.name ?? ""}`)
        )
      );
    }

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    const lineas = fields.map(f => `**${f.name}:** ${f.value}`).join("\n");
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(lineas)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${new Date().toLocaleString("es-PA")}`
      )
    );

    return container;
  }

  // 📤 Enviar log
  async function sendLog(guild, container) {
    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;
    await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    }).catch(() => {});
  }

  // ==============================
  // 👤 MIEMBRO — ROL / APODO
  // ==============================
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    const addedRoles   = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    // ✅ UN solo mensaje con todos los roles añadidos
    if (addedRoles.size > 0) {
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0x2ecc71,
        titulo:   `➕ Rol${addedRoles.size > 1 ? "es" : ""} añadido${addedRoles.size > 1 ? "s" : ""}`,
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: `🏷️ Rol${addedRoles.size > 1 ? "es" : ""}`, value: addedRoles.map(r => `<@&${r.id}>`).join(", ") },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    // ✅ UN solo mensaje con todos los roles removidos
    if (removedRoles.size > 0) {
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0xe74c3c,
        titulo:   `➖ Rol${removedRoles.size > 1 ? "es" : ""} removido${removedRoles.size > 1 ? "s" : ""}`,
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: `🏷️ Rol${removedRoles.size > 1 ? "es" : ""}`, value: removedRoles.map(r => `<@&${r.id}>`).join(", ") },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    // ✅ Si hubo ambos (añadidos Y removidos) al mismo tiempo — UN solo mensaje
    // Esto cubre el caso de bots que intercambian roles en bloque
    if (addedRoles.size > 0 && removedRoles.size > 0) {
      // Ya se enviaron arriba por separado, pero si prefieres uno solo
      // puedes comentar los dos bloques de arriba y usar este:
      /*
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0xf1c40f,
        titulo:   "🔄 Roles actualizados",
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",   value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: "➕ Añadidos",  value: addedRoles.map(r => `<@&${r.id}>`).join(", ") || "Ninguno" },
          { name: "➖ Removidos", value: removedRoles.map(r => `<@&${r.id}>`).join(", ") || "Ninguno" },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
      */
    }

    // Apodo
    if (oldMember.nickname !== newMember.nickname) {
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0xf1c40f,
        titulo:   "✏️ Apodo cambiado",
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: "📌 Antes",        value: oldMember.nickname || "Sin apodo" },
          { name: "📌 Después",      value: newMember.nickname || "Sin apodo" },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    // Timeout aplicado
    const oldTimeout = oldMember.communicationDisabledUntil;
    const newTimeout = newMember.communicationDisabledUntil;

    if (!oldTimeout && newTimeout && newTimeout > new Date()) {
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0xe67e22,
        titulo:   "🔇 Timeout aplicado",
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: "⏱️ Expira",       value: `<t:${Math.floor(newTimeout.getTime() / 1000)}:R>` },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    if (oldTimeout && (!newTimeout || newTimeout <= new Date())) {
      const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id);
      await sendLog(newMember.guild, log({
        color:    0x2ecc71,
        titulo:   "🔊 Timeout removido",
        guild:    newMember.guild,
        avatarUrl: newMember.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${newMember.id}> (${newMember.user.tag})` },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }
  });

  // ==============================
  // 🟢 ENTRÓ AL SERVIDOR
  // ==============================
  client.on("guildMemberAdd", async (member) => {
    await sendLog(member.guild, log({
      color:    0x57f287,
      titulo:   "🟢 Nuevo miembro",
      guild:    member.guild,
      avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
      fields: [
        { name: "👤 Usuario",        value: `<@${member.id}> (${member.user.tag})` },
        { name: "📅 Cuenta creada",  value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
        { name: "👥 Miembros ahora", value: `${member.guild.memberCount}` }
      ]
    }));
  });

  // ==============================
  // 🔴 SALIÓ / KICK
  // ==============================
  client.on("guildMemberRemove", async (member) => {

    // Ignorar si fue ban (se maneja en guildBanAdd)
    const banCheck = await member.guild.bans.fetch(member.id).catch(() => null);
    if (banCheck) return;

    const executor = await getExecutor(member.guild, AuditLogEvent.MemberKick, member.id);

    // Si hay executor reciente = kick, si no = salida voluntaria
    if (executor) {
      await sendLog(member.guild, log({
        color:    0xe67e22,
        titulo:   "👢 Miembro expulsado (Kick)",
        guild:    member.guild,
        avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",      value: `<@${member.id}> (${member.user.tag})` },
          { name: "🛡️ Responsable", value: `${executor.tag} (<@${executor.id}>)` }
        ]
      }));
    } else {
      await sendLog(member.guild, log({
        color:    0x95a5a6,
        titulo:   "🚪 Miembro salió",
        guild:    member.guild,
        avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario",        value: `<@${member.id}> (${member.user.tag})` },
          { name: "👥 Miembros ahora", value: `${member.guild.memberCount}` }
        ]
      }));
    }
  });

  // ==============================
  // 🔨 BAN / UNBAN
  // ==============================
  client.on("guildBanAdd", async (ban) => {
    const executor = await getExecutor(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
    await sendLog(ban.guild, log({
      color:    0x992d22,
      titulo:   "🔨 Usuario baneado",
      guild:    ban.guild,
      avatarUrl: ban.user.displayAvatarURL({ extension: "png", size: 256 }),
      fields: [
        { name: "👤 Usuario",      value: `<@${ban.user.id}> (${ban.user.tag})` },
        { name: "📝 Razón",        value: ban.reason || "Sin razón especificada" },
        { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  client.on("guildBanRemove", async (ban) => {
    const executor = await getExecutor(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
    await sendLog(ban.guild, log({
      color:    0x2ecc71,
      titulo:   "✅ Ban removido",
      guild:    ban.guild,
      avatarUrl: ban.user.displayAvatarURL({ extension: "png", size: 256 }),
      fields: [
        { name: "👤 Usuario",      value: `<@${ban.user.id}> (${ban.user.tag})` },
        { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  // ==============================
  // 💬 MENSAJES
  // ==============================
  client.on("messageDelete", async (message) => {
    if (!message.guild || message.author?.bot) return;
    if (!message.content && message.attachments.size === 0) return;

    const executor = await getExecutor(message.guild, AuditLogEvent.MessageDelete, message.author?.id);

    await sendLog(message.guild, log({
      color:    0xe74c3c,
      titulo:   "🗑️ Mensaje eliminado",
      guild:    message.guild,
      avatarUrl: message.author?.displayAvatarURL({ extension: "png", size: 256 }),
      fields: [
        { name: "👤 Autor",        value: message.author ? `<@${message.author.id}> (${message.author.tag})` : "Desconocido" },
        { name: "📍 Canal",        value: `<#${message.channel.id}>` },
        { name: "📝 Contenido",    value: message.content ? (message.content.length > 800 ? message.content.slice(0, 800) + "..." : message.content) : "Sin texto" },
        { name: "🛡️ Eliminado por", value: executor ? `${executor.tag} (<@${executor.id}>)` : "El mismo usuario" }
      ]
    }));
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    await sendLog(newMessage.guild, log({
      color:    0xf1c40f,
      titulo:   "✏️ Mensaje editado",
      guild:    newMessage.guild,
      avatarUrl: newMessage.author?.displayAvatarURL({ extension: "png", size: 256 }),
      fields: [
        { name: "👤 Autor",     value: `<@${newMessage.author.id}> (${newMessage.author.tag})` },
        { name: "📍 Canal",     value: `<#${newMessage.channel.id}>` },
        { name: "📝 Antes",     value: oldMessage.content ? (oldMessage.content.length > 400 ? oldMessage.content.slice(0, 400) + "..." : oldMessage.content) : "Sin texto" },
        { name: "📝 Después",   value: newMessage.content ? (newMessage.content.length > 400 ? newMessage.content.slice(0, 400) + "..." : newMessage.content) : "Sin texto" },
        { name: "🔗 Ver",       value: `[Ir al mensaje](${newMessage.url})` }
      ]
    }));
  });

  // ==============================
  // 🏷️ ROLES
  // ==============================
  client.on("roleCreate", async (role) => {
    const executor = await getExecutor(role.guild, AuditLogEvent.RoleCreate, role.id);
    await sendLog(role.guild, log({
      color:  0x2ecc71,
      titulo: "➕ Rol creado",
      guild:  role.guild,
      fields: [
        { name: "🏷️ Nombre",       value: `<@&${role.id}> (${role.name})` },
        { name: "🎨 Color",         value: role.hexColor },
        { name: "🛡️ Responsable",  value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  client.on("roleDelete", async (role) => {
    const executor = await getExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);
    await sendLog(role.guild, log({
      color:  0xe74c3c,
      titulo: "❌ Rol eliminado",
      guild:  role.guild,
      fields: [
        { name: "🏷️ Nombre",      value: role.name },
        { name: "🎨 Color",        value: role.hexColor },
        { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  client.on("roleUpdate", async (oldRole, newRole) => {
    const executor = await getExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);

    if (oldRole.name !== newRole.name) {
      await sendLog(newRole.guild, log({
        color:  0xf1c40f,
        titulo: "✏️ Rol renombrado",
        guild:  newRole.guild,
        fields: [
          { name: "🏷️ Rol",         value: `<@&${newRole.id}>` },
          { name: "📌 Antes",        value: oldRole.name },
          { name: "📌 Después",      value: newRole.name },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      await sendLog(newRole.guild, log({
        color:  0xffa500,
        titulo: "⚠️ Permisos de rol modificados",
        guild:  newRole.guild,
        fields: [
          { name: "🏷️ Rol",         value: `<@&${newRole.id}> (${newRole.name})` },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }
  });

  // ==============================
  // 📁 CANALES
  // ==============================
  client.on("channelCreate", async (ch) => {
    if (!ch.guild) return;
    const executor = await getExecutor(ch.guild, AuditLogEvent.ChannelCreate, ch.id);
    if (executor?.bot) return; // ignorar bots como ServerStats
    await sendLog(ch.guild, log({
      color:  0x2ecc71,
      titulo: "📁 Canal creado",
      guild:  ch.guild,
      fields: [
        { name: "📌 Canal",        value: `<#${ch.id}> (${ch.name})` },
        { name: "📂 Tipo",         value: ch.type.toString() },
        { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  client.on("channelDelete", async (ch) => {
    if (!ch.guild) return;
    const executor = await getExecutor(ch.guild, AuditLogEvent.ChannelDelete, ch.id);
    if (executor?.bot) return;
    await sendLog(ch.guild, log({
      color:  0xe74c3c,
      titulo: "❌ Canal eliminado",
      guild:  ch.guild,
      fields: [
        { name: "📌 Nombre",       value: ch.name },
        { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
      ]
    }));
  });

  client.on("channelUpdate", async (oldCh, newCh) => {
    if (!newCh.guild) return;
    const executor = await getExecutor(newCh.guild, AuditLogEvent.ChannelUpdate, newCh.id);
    if (executor?.bot) return; // ✅ ignora ServerStats y otros bots

    if (oldCh.name !== newCh.name) {
      await sendLog(newCh.guild, log({
        color:  0xf1c40f,
        titulo: "✏️ Canal renombrado",
        guild:  newCh.guild,
        fields: [
          { name: "📌 Canal",        value: `<#${newCh.id}>` },
          { name: "📌 Antes",        value: oldCh.name },
          { name: "📌 Después",      value: newCh.name },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    if (oldCh.permissionOverwrites?.cache.size !== newCh.permissionOverwrites?.cache.size) {
      await sendLog(newCh.guild, log({
        color:  0xffa500,
        titulo: "⚠️ Permisos de canal modificados",
        guild:  newCh.guild,
        fields: [
          { name: "📌 Canal",        value: `<#${newCh.id}> (${newCh.name})` },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }
  });

  // ==============================
  // 📨 INVITACIONES
  // ==============================
  const invitesCache = new Map();

  client.on("guildCreate", async (guild) => {
    const invites = await guild.invites.fetch().catch(() => null);
    if (invites) invitesCache.set(guild.id, invites);
  });

  client.on("inviteCreate", async (invite) => {
    const executor = await getExecutor(invite.guild, AuditLogEvent.InviteCreate);
    const invites  = await invite.guild.invites.fetch().catch(() => null);
    if (invites) invitesCache.set(invite.guild.id, invites);

    await sendLog(invite.guild, log({
      color:  0x3498db,
      titulo: "📨 Invitación creada",
      guild:  invite.guild,
      fields: [
        { name: "🔗 Código",        value: invite.code },
        { name: "📍 Canal",         value: invite.channel ? `<#${invite.channel.id}>` : "Desconocido" },
        { name: "⏱️ Expira",        value: invite.maxAge ? `En ${invite.maxAge / 3600}h` : "Nunca" },
        { name: "🔢 Usos máximos",  value: invite.maxUses ? `${invite.maxUses}` : "Ilimitados" },
        { name: "🛡️ Creador",      value: executor ? `${executor.tag} (<@${executor.id}>)` : invite.inviter?.tag || "Desconocido" }
      ]
    }));
  });

  client.on("inviteDelete", async (invite) => {
    await sendLog(invite.guild, log({
      color:  0xe74c3c,
      titulo: "🗑️ Invitación eliminada",
      guild:  invite.guild,
      fields: [
        { name: "🔗 Código",  value: invite.code },
        { name: "📍 Canal",   value: invite.channel ? `<#${invite.channel.id}>` : "Desconocido" }
      ]
    }));
  });

  // ==============================
  // 🔊 VOZ
  // ==============================
  client.on("voiceStateUpdate", async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    // Entró a un canal de voz
    if (!oldState.channel && newState.channel) {
      await sendLog(member.guild, log({
        color:    0x2ecc71,
        titulo:   "🔊 Entró a voz",
        guild:    member.guild,
        avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario", value: `<@${member.id}> (${member.user.tag})` },
          { name: "🔊 Canal",   value: `<#${newState.channel.id}> (${newState.channel.name})` }
        ]
      }));
    }

    // Salió de un canal de voz
    if (oldState.channel && !newState.channel) {
      await sendLog(member.guild, log({
        color:    0xe74c3c,
        titulo:   "🔇 Salió de voz",
        guild:    member.guild,
        avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario", value: `<@${member.id}> (${member.user.tag})` },
          { name: "🔊 Canal",   value: `<#${oldState.channel.id}> (${oldState.channel.name})` }
        ]
      }));
    }

    // Cambió de canal
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      await sendLog(member.guild, log({
        color:    0xf1c40f,
        titulo:   "🔀 Cambió de canal de voz",
        guild:    member.guild,
        avatarUrl: member.user.displayAvatarURL({ extension: "png", size: 256 }),
        fields: [
          { name: "👤 Usuario", value: `<@${member.id}> (${member.user.tag})` },
          { name: "📤 Antes",   value: `<#${oldState.channel.id}> (${oldState.channel.name})` },
          { name: "📥 Después", value: `<#${newState.channel.id}> (${newState.channel.name})` }
        ]
      }));
    }
  });

  // ==============================
  // 🏠 SERVIDOR
  // ==============================
  client.on("guildUpdate", async (oldGuild, newGuild) => {
    const executor = await getExecutor(newGuild, AuditLogEvent.GuildUpdate);

    if (oldGuild.name !== newGuild.name) {
      await sendLog(newGuild, log({
        color:  0xf1c40f,
        titulo: "✏️ Nombre del servidor cambiado",
        guild:  newGuild,
        fields: [
          { name: "📌 Antes",        value: oldGuild.name },
          { name: "📌 Después",      value: newGuild.name },
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }

    if (oldGuild.iconURL() !== newGuild.iconURL()) {
      await sendLog(newGuild, log({
        color:    0x3498db,
        titulo:   "🖼️ Ícono del servidor cambiado",
        guild:    newGuild,
        avatarUrl: newGuild.iconURL({ extension: "png", size: 256 }) || undefined,
        fields: [
          { name: "🛡️ Responsable", value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" }
        ]
      }));
    }
  });

};
