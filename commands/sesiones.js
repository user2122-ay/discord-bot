const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const ROL_AUTORIZADO = "1451018406537986168";
const ROL_PING = "1451018397352595579";

const CANAL_SESION = "1451018683383156827";
const CANAL_LOGS = "1497610703677161493";

let votacionActiva = false;
let votos = new Set();

module.exports = {
data: new SlashCommandBuilder()
.setName("sesion")
.setDescription("Panel de sesiones del servidor"),

permisos: "🛡️ Staff",

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
"Se declara oficialmente ABIERTA la sesión en el servidor. A partir de este momento, se da inicio a las actividades dentro de la comunidad.\n\n" +
"🗳️ Participación requerida: Activa\n" +
"⏳ Estado: En curso\n\n" +
"Es fundamental la participación de todos los miembros para garantizar un entorno organizado, activo y realista.\n\n" +
"⚠️ Indicaciones:\n" +
"• Mantener el orden y el respeto.\n" +
"• Seguir instrucciones del staff.\n" +
"• Priorizar el rol serio.\n\n" +
"🔥 La sesión ha comenzado… el roleplay está en tus manos. 🔥"
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
.setDescription(
"Se declara oficialmente CERRADA la sesión en el servidor.\n\n" +
"A partir de este momento, todas las actividades de roleplay quedan suspendidas hasta nuevo aviso.\n\n" +
"📊 Estado: Finalizado\n\n" +
"Agradecemos a todos los usuarios por su participación y compromiso durante la sesión.\n\n" +
"📢 Mantente atento a futuros anuncios para la próxima apertura.\n\n" +
"🔥 Gracias por formar parte de la comunidad. 🔥"
)
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
.setDescription(
"Se informa a todos los miembros que el servidor se encuentra actualmente en MANTENIMIENTO.\n\n" +
"⚙️ Durante este periodo se estarán realizando ajustes, mejoras y optimizaciones.\n\n" +
"⏳ Estado: En progreso\n" +
"🔧 Acceso: Limitado temporalmente\n\n" +
"⚠️ Recomendaciones:\n" +
"• Evitar realizar acciones dentro del servidor.\n" +
"• Esperar indicaciones del staff.\n" +
"• Mantenerse atentos a anuncios oficiales.\n\n" +
"📢 Una vez finalizado el mantenimiento, se notificará la reapertura.\n\n" +
"🔥 Estamos trabajando para darte una mejor experiencia. 🔥"
)
.setColor(0x95a5a6);

canal.send({ embeds: [embed] });

return i.update({ content: "🛠️ Activado", components: [] });

}

// 🗳️ VOTACIÓN (ARREGLADO)
if (i.customId === "votar") {

if (votacionActiva) {
return i.reply({ content: "❌ Ya hay una votación.", ephemeral: true });
}

votacionActiva = true;
votos.clear();

const embed = new EmbedBuilder()
.setTitle("📢 SESIÓN DE VOTACIÓN ABIERTA — SERVIDOR ROLEPLAY")
.setDescription(
"Se declara oficialmente ABIERTA la sesión de votación en el servidor.\n\n" +
"🗳️ Votos requeridos: 0/8\n\n" +
"👥 Votantes:\nAún no hay votos registrados.\n\n" +
"⏳ Tiempo restante: 20 minutos\n\n" +
"Cada voto cuenta y puede marcar la diferencia.\n\n" +
"⚠️ Recuerda:\n" +
"• Solo se permite un voto por persona.\n" +
"• Mantén el respeto.\n" +
"• La decisión es democrática.\n\n" +
"🔥 ¡Tu voz tiene poder, hazla valer! 🔥"
)
.setColor(0xf1c40f)
.setFooter({
text: `Votación iniciada por ${i.user.tag}`,
iconURL: i.user.displayAvatarURL()
});

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

// ✅ FIX REAL
const collectorV = msg.createMessageComponentCollector({
time: 20 * 60 * 1000,
filter: btn => btn.customId === "votar_si"
});

collectorV.on("collect", async btn => {

if (votos.has(btn.user.id)) {
return btn.reply({ content: "❌ Ya votaste.", ephemeral: true });
}

votos.add(btn.user.id);

const lista = [...votos].map(id => `<@${id}>`).join("\n");

await msg.edit({
embeds: [
EmbedBuilder.from(embed).setDescription(
"📢 SESIÓN DE VOTACIÓN ABIERTA — SERVIDOR ROLEPLAY\n\n" +
`🗳️ Votos requeridos: ${votos.size}/8\n\n` +
`👥 Votantes:\n${lista}\n\n` +
"⏳ Tiempo restante: En curso\n\n" +
"🔥 Tu voto decide el futuro del servidor. 🔥"
)
]
});

await btn.reply({ content: "✅ Votaste", ephemeral: true });

if (votos.size >= 8) collectorV.stop();
});

collectorV.on("end", async () => {

votacionActiva = false;

if (votos.size >= 8) {

canal.send({
content: `<@&${ROL_PING}>`,
embeds: [
new EmbedBuilder()
.setTitle("🟢 SESIÓN ABIERTA AUTOMÁTICAMENTE")
.setDescription(
"🎉 Se han alcanzado los votos necesarios.\n\n" +
"El servidor queda oficialmente ABIERTO.\n\n" +
"⏳ Tienen 10 minutos para ingresar y comenzar a rolear.\n\n" +
"⚠️ El incumplimiento podrá ser sancionado.\n\n" +
"🔥 ¡El roleplay comienza ahora! 🔥"
)
.setColor(0x2ecc71)
],
allowedMentions: { roles: [ROL_PING] }
});

} else {

canal.send({
embeds: [
new EmbedBuilder()
.setTitle("🔒 SESIÓN DE VOTACIÓN CERRADA — SERVIDOR ROLEPLAY")
.setDescription(
"No se alcanzaron los votos necesarios.\n\n" +
"📊 Estado: Finalizado\n\n" +
"🔥 Gracias por participar."
)
.setColor(0xe74c3c)
]
});

}

msg.edit({ components: [] });

logs.send({
embeds: [
new EmbedBuilder()
.setTitle("📊 LOG VOTACIÓN")
.setDescription(`Votos: ${votos.size}/8\nResponsable: <@${i.user.id}>`)
.setColor(0xf1c40f)
]
});

});

return i.update({ content: "🗳️ Votación iniciada", components: [] });

}

});

}
};
