const LOG_CHANNEL_ID = "1463192293312958628";

module.exports = (client) => {

  const spamMap = new Map();
  const mentionMap = new Map();

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const now = Date.now();

    // =========================
    // 🚨 SPAM DE MENSAJES
    // =========================
    let spamData = spamMap.get(message.author.id) || { count: 0, last: now };

    if (now - spamData.last < 4000) {
      spamData.count++;
    } else {
      spamData.count = 1;
    }

    spamData.last = now;
    spamMap.set(message.author.id, spamData);

    if (spamData.count === 5) {
      message.channel.send(`⚠️ <@${message.author.id}> deja de hacer spam.`);
    }

    if (spamData.count === 8) {
      try {
        await message.member.timeout(600000);
        message.channel.send(`🔇 <@${message.author.id}> ha sido silenciado por spam.`);
        logChannel.send(`🔇 TIMEOUT POR SPAM | ${message.author.tag}`);
      } catch {}
    }

    if (spamData.count >= 12) {
      try {
        await message.member.kick("Spam extremo");
        logChannel.send(`🚫 KICK POR SPAM | ${message.author.tag}`);
      } catch {}
    }

    // =========================
    // 📢 SPAM DE PINGS
    // =========================
    let mentionData = mentionMap.get(message.author.id) || { count: 0 };

    if (message.mentions.users.size >= 3) {
      mentionData.count++;

      if (mentionData.count === 2) {
        message.channel.send(`⚠️ <@${message.author.id}> no hagas spam de menciones.`);
      }

      if (mentionData.count >= 4) {
        try {
          await message.member.timeout(900000);
          logChannel.send(`📢 TIMEOUT POR PINGS | ${message.author.tag}`);
        } catch {}
      }
    }

    mentionMap.set(message.author.id, mentionData);

    // =========================
    // 🚨 ANTI RAID
    // =========================
    if (message.mentions.everyone || message.content.includes("@here")) {
      try {
        await message.member.ban({ reason: "Raid detectado" });

        message.channel.send(`🚨 Usuario baneado por raid.`);
        logChannel.send(`🚨 BAN POR RAID | ${message.author.tag}`);
      } catch {}
    }

  });

};
