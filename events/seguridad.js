const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  const LOG_CHANNEL_ID = "1452157557551661167";

  const spamMensajes = new Map();
  const spamPings    = new Map();
  const canalSpam    = new Map();

  // 🧱 Función cajón de log
  function crearContainer({ accentColor, categoria, titulo, user, fields, guild }) {

    const container = new ContainerBuilder()
      .setAccentColor(accentColor);

    // Header con thumbnail si hay usuario
    if (user) {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${titulo}\n` +
              `-# ${categoria} • ${guild.name}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              user.displayAvatarURL?.({ extension: "png", size: 256 }) ??
              guild.iconURL({ extension: "png" })
            )
          )
      );
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${titulo}\n` +
          `-# ${categoria} • ${guild.name}`
        )
      );
    }

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    // Campos
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

  // ==============================
  // 🚨 ANTI SPAM MENSAJES
  // ==============================
  client.on("messageCreate", async (message) => {

    if (!message.guild || message.author.bot) return;

    const log = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!log) return;

    const now  = Date.now();
    const data = spamMensajes.get(message.author.id) || { count: 0, last: now };

    if (now - data.last < 5000) data.count++;
    else data.count = 1;
    data.last = now;
    spamMensajes.set(message.author.id, data);

    // ⚠️ Advertencia
    if (data.count === 5) {
      message.reply("⚠️ Estás enviando mensajes muy rápido. Por favor evita el spam.").catch(() => {});
    }

    // 🚨 Sanción
    if (data.count >= 8) {
      await message.member.timeout(60000).catch(() => {});
      spamMensajes.set(message.author.id, { count: 0, last: now }); // reset

      await log.send({
        flags: MessageFlags.IsComponentsV2,
        components: [crearContainer({
          accentColor: 0xe74c3c,
          categoria:   "🚨 ANTI-SPAM",
          titulo:      "🚨 Spam de mensajes detectado",
          user:        message.author,
          guild:       message.guild,
          fields: [
            { name: "👤 Usuario",  value: `<@${message.author.id}> (${message.author.tag})` },
            { name: "📍 Canal",    value: `<#${message.channel.id}>` },
            { name: "⚡ Mensajes", value: `${data.count} mensajes en menos de 5s` },
            { name: "🔇 Acción",   value: "Silenciado por **1 minuto**" }
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

    const now  = Date.now();
    const data = spamPings.get(message.author.id) || { count: 0, last: now };

    if (now - data.last < 5000) data.count++;
    else data.count = 1;
    data.last = now;
    spamPings.set(message.author.id, data);

    if (message.mentions.users.size >= 5 || data.count >= 5) {
      await message.member.timeout(120000).catch(() => {});
      spamPings.set(message.author.id, { count: 0, last: now }); // reset

      await log.send({
        flags: MessageFlags.IsComponentsV2,
        components: [crearContainer({
          accentColor: 0xe67e22,
          categoria:   "📣 ANTI-PING",
          titulo:      "📣 Spam de menciones detectado",
          user:        message.author,
          guild:       message.guild,
          fields: [
            { name: "👤 Usuario",   value: `<@${message.author.id}> (${message.author.tag})` },
            { name: "📍 Canal",     value: `<#${message.channel.id}>` },
            { name: "🔔 Menciones", value: `${message.mentions.users.size} usuarios mencionados` },
            { name: "🔇 Acción",    value: "Silenciado por **2 minutos**" }
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
    const log   = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!log) return;

    const now  = Date.now();
    const data = canalSpam.get(guild.id) || { count: 0, last: now };

    if (now - data.last < 60000) data.count++;
    else data.count = 1;
    data.last = now;
    canalSpam.set(guild.id, data);

    const logs     = await guild.fetchAuditLogs({ limit: 1, type: 10 }).catch(() => null);
    const executor = logs?.entries.first()?.executor;

    // ⚠️ Alerta temprana
    if (data.count >= 2) {
      await log.send({
        flags: MessageFlags.IsComponentsV2,
        components: [crearContainer({
          accentColor: 0xf1c40f,
          categoria:   "⚠️ ANTI-RAID",
          titulo:      "⚠️ Posible raid de canales",
          user:        executor || null,
          guild,
          fields: [
            { name: "👤 Ejecutor",        value: executor ? `${executor.tag} (<@${executor.id}>)` : "Desconocido" },
            { name: "📁 Canal creado",    value: `#${channel.name}` },
            { name: "📊 Canales creados", value: `${data.count} en el último minuto` },
            { name: "⚠️ Estado",          value: "Monitoreo activo — sin acción aún" }
          ]
        })]
      });
    }

    // 🚨 Raid confirmado — ban automático
    if (data.count >= 4 && executor) {
      await guild.members.ban(executor.id, { reason: "Anti-Raid: creación masiva de canales" }).catch(() => {});
      canalSpam.set(guild.id, { count: 0, last: now }); // reset

      await log.send({
        flags: MessageFlags.IsComponentsV2,
        components: [crearContainer({
          accentColor: 0xe74c3c,
          categoria:   "🚨 ANTI-RAID",
          titulo:      "🚨 RAID DETECTADO — Ban automático",
          user:        executor,
          guild,
          fields: [
            { name: "👤 Usuario baneado", value: `${executor.tag} (\`${executor.id}\`)` },
            { name: "📊 Canales creados", value: `${data.count} en menos de 1 minuto` },
            { name: "🔨 Acción",          value: "**Ban permanente** aplicado automáticamente" },
            { name: "📁 Último canal",    value: `#${channel.name}` }
          ]
        })]
      });
    }
  });

};
