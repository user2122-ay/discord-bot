const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

const ROL_AUTORIZADO = "1463192290423083324";
const ROL_PING = "1463192290360295646";

const CANAL_SESION = "1463192291056423024";
const CANAL_LOGS = "1463192293312958628";

let votacionActiva = false;
let votos = new Set();

module.exports = {
data: new SlashCommandBuilder()
.setName("sesion")
.setDescription("📊 Panel de sesiones del servidor")
.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // 🔒 PERMISO STAFF

async execute(interaction) {

if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {  
  return interaction.reply({ content: "⛔ No tienes permisos.", ephemeral: true });  
}  

const panel = new EmbedBuilder()  
  .setTitle("📊 Panel de Control de Sesiones")  
  .setDescription(  
    "Desde este panel podrás gestionar el estado del servidor.\n\n" +  
    "🔹 Abrir sesión\n🔹 Cerrar sesión\n🔹 Iniciar votación\n🔹 Activar mantenimiento\n\n" +  
    "📌 Usa los botones de abajo."  
  )  
  .setColor(0x3498db);  

const botones = new ActionRowBuilder().addComponents(  
  new ButtonBuilder().setCustomId("abrir").setLabel("🟢 Abrir").setStyle(ButtonStyle.Success),  
  new ButtonBuilder().setCustomId("cerrar").setLabel("🔴 Cerrar").setStyle(ButtonStyle.Danger),  
  new ButtonBuilder().setCustomId("votar").setLabel("🗳️ Votación").setStyle(ButtonStyle.Primary),  
  new ButtonBuilder().setCustomId("mantenimiento").setLabel("🛠️ Mantenimiento").setStyle(ButtonStyle.Secondary)  
);  

await interaction.reply({ embeds: [panel], components: [botones], ephemeral: true });  

const collector = interaction.channel.createMessageComponentCollector({ time: 600000 });  

collector.on("collect", async i => {  

  if (i.user.id !== interaction.user.id) {  
    return i.reply({ content: "❌ No puedes usar esto.", ephemeral: true });  
  }  

  const canal = interaction.guild.channels.cache.get(CANAL_SESION);  
  const logs = interaction.guild.channels.cache.get(CANAL_LOGS);  

  // 🟢 ABRIR  
  if (i.customId === "abrir") {  

    const embed = new EmbedBuilder()  
      .setTitle("📢 SESIÓN ABIERTA — SERVIDOR ROLEPLAY")  
      .setDescription(
        "Se declara oficialmente **ABIERTA** la sesión en el servidor..."
      )  
      .setColor(0x2ecc71)  
      .setFooter({  
        text: `Apertura realizada por ${i.user.tag}`,  
        iconURL: i.user.displayAvatarURL()  
      })  
      .setTimestamp();  

    canal.send({  
      content: `<@&${ROL_PING}>`,  
      embeds: [embed],  
      allowedMentions: { roles: [ROL_PING] }  
    });  

    logs.send({  
      embeds: [
        new EmbedBuilder()
          .setTitle("📊 LOG SESIÓN")
          .setDescription(`🟢 Sesión abierta por <@${i.user.id}>`)
          .setColor(0x2ecc71)
      ]
    });

    return i.update({ content: "✅ Sesión abierta", components: [] });
  }

  // 🔴 CERRAR
  if (i.customId === "cerrar") {

    const embed = new EmbedBuilder()
      .setTitle("🔴 SESIÓN CERRADA — SERVIDOR ROLEPLAY")
      .setDescription("Se declara oficialmente **CERRADA** la sesión...")
      .setColor(0xe74c3c)
      .setFooter({
        text: `Cierre realizado por ${i.user.tag}`,
        iconURL: i.user.displayAvatarURL()
      })
      .setTimestamp();

    canal.send({
      content: `<@&${ROL_PING}>`,
      embeds: [embed],
      allowedMentions: { roles: [ROL_PING] }
    });

    logs.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(`🔴 Sesión cerrada por <@${i.user.id}>`)
          .setColor(0xe74c3c)
      ]
    });

    return i.update({ content: "❌ Sesión cerrada", components: [] });
  }

  // 🛠️ MANTENIMIENTO
  if (i.customId === "mantenimiento") {

    const embed = new EmbedBuilder()
      .setTitle("🛠️ MANTENIMIENTO DEL SERVIDOR — ROLEPLAY")
      .setDescription("Servidor en mantenimiento...")
      .setColor(0x95a5a6);

    canal.send({ embeds: [embed] });

    return i.update({ content: "🛠️ Activado", components: [] });
  }

  // 🗳️ VOTACIÓN (sin cambios)
  if (i.customId === "votar") {
    if (votacionActiva) {
      return i.reply({ content: "❌ Ya hay una votación.", ephemeral: true });
    }

    votacionActiva = true;
    votos.clear();

    const embed = new EmbedBuilder()
      .setTitle("📢 SESIÓN DE VOTACIÓN ABIERTA — SERVIDOR ROLEPLAY")
      .setDescription("Votación iniciada...")
      .setColor(0xf1c40f);

    const boton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("votar_si")
        .setLabel("✅ Votar")
        .setStyle(ButtonStyle.Success)
    );

    const msg = await canal.send({
      content: `<@&${ROL_PING}>`,
      embeds: [embed],
      components: [boton],
      allowedMentions: { roles: [ROL_PING] }
    });

    return i.update({ content: "🗳️ Votación iniciada", components: [] });
  }

});

}
};
