const { 
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ThumbnailBuilder,
    MessageFlags, 
    MediaGalleryBuilder,
  MediaGalleryItemBuilder 
} = require("discord.js");
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


const panel = new ContainerBuilder()
    .addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# 📊 Panel de Control de Sesiones

Gestiona el estado oficial del servidor roleplay.

━━━━━━━━━━━━━━━━━━

🟢 Abrir Sesión
Permite iniciar oficialmente las actividades.

🔴 Cerrar Sesión
Finaliza las actividades del servidor.

🗳️ Iniciar Votación
Los usuarios podrán votar para abrir sesión.

🛠️ Mantenimiento
Activa el modo mantenimiento.

━━━━━━━━━━━━━━━━━━

⚠️ Usa los botones inferiores para administrar el servidor.`
                )
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setCustomId("abrir")
                    .setLabel("Abrir")
                    .setEmoji("🟢")
                    .setStyle(ButtonStyle.Success)
            )
    )

    .addSeparatorComponents(
        new SeparatorBuilder()
    )

.addActionRowComponents(
    new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("cerrar")
            .setLabel("Cerrar")
            .setEmoji("🔴")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("votar")
            .setLabel("Votación")
            .setEmoji("🗳️")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("mantenimiento")
            .setLabel("Mantenimiento")
            .setEmoji("🛠️")
            .setStyle(ButtonStyle.Secondary)

    )
);
await interaction.reply({
    components: [panel],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
});

   const collector = interaction.channel.createMessageComponentCollector({
    time: 600000
});

collector.on("collect", async i => {

    if (i.user.id !== interaction.user.id) {
        return i.reply({
            content: "❌ No puedes usar esto.",
            ephemeral: true
        });
    }

    const canal = interaction.guild.channels.cache.get(CANAL_SESION);
    const logs = interaction.guild.channels.cache.get(CANAL_LOGS);

   
// 🟢 ABRIR
if (i.customId === "abrir") {

const apertura = new ContainerBuilder()
.setAccentColor(0x57F287) // verde Discord

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
    )
)

.addSectionComponents(
    new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
`# 🟢 Servidor Abierto

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> ✅ La sesión ha sido abierta oficialmente.

> **Código:** \`\`\`hhhh\`\`\`
> 👥 Los usuarios ya pueden ingresar
> y comenzar el roleplay.
╰━━━━━━━━━━━━━━━━╯

### 📌 Indicaciones
• Mantener el rol serio
• Respetar las normas
• Seguir instrucciones del staff

🔥 ¡El roleplay comienza ahora!`
            )
        )

        .setThumbnailAccessory(
            new ThumbnailBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png?ex=6a1a35e6&is=6a18e466&hm=8f27e223e994b963d68c0945d6d4b3f04e79d193eb7f8dbace121ff849ec115e&")
        )
)

.addSeparatorComponents(
    new SeparatorBuilder()
)

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`🌐 **PANAMÁ RP V2**
### Sistema Oficial de Sesiones

> Roleplay serio • Comunidad activa • Administración oficial`
    )
)

.addMediaGalleryComponents(
  new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder()
      .setURL("https://cdn.discordapp.com/attachments/1455970934535225518/1509727251342823578/sidistroatribut01-progress-100-transparent-22958.gif?ex=6a1a3a92&is=6a18e912&hm=712861e4f7c631a31c374f6603680e081bdbb440664dfc1f0940c8e097989213&")
  )
);

await canal.send({
    components: [apertura],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: {
        roles: [ROL_PING]
    }
});

await logs.send({
    embeds: [
        new EmbedBuilder()
        .setDescription(`🟢 Sesión abierta por <@${i.user.id}>`)
        .setColor(0x2ecc71)
    ]
});

return i.update({
    components: [
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("✅ Sesión abierta con éxito.")
            )
    ],
    flags: MessageFlags.IsComponentsV2
});
} 
    
// 🔴 CERRAR
if (i.customId === "cerrar") {

const cierre = new ContainerBuilder()
.setAccentColor(0xED4245) // rojo Discord

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
    )
)

.addSectionComponents(
    new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
`# 🔴 Servidor Cerrado

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> ❌ La sesión ha sido cerrada oficialmente.

> 📊 Estado: \`\`\`FINALIZADO\`\`\`

> 🚫 Todas las actividades de roleplay
> quedan suspendidas hasta nuevo aviso.
╰━━━━━━━━━━━━━━━━╯

### 📌 Información
• El servidor entra en descanso
• Espera próximos anuncios oficiales
• Gracias por participar en la sesión

🔥 Gracias por formar parte de la comunidad 🔥`
            )
        )

        .setThumbnailAccessory(
            new ThumbnailBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png")
        )
)

.addSeparatorComponents(
    new SeparatorBuilder()
)

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`🌐 **PANAMÁ RP V2**
### Sistema Oficial de Sesiones

> Sesión finalizada • Administración oficial`
    )
)

.addMediaGalleryComponents(
  new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder()
      .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509752792137597080/l102-0961-closed-animated-led-sign.gif?ex=6a1a525b&is=6a1900db&hm=0dd043efe79018c7e6e99ed98e95bce8ea8ee3a9023edad3e9bf3aeca36db9f9&")
  )
);

await canal.send({
    components: [cierre],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: {
        roles: [ROL_PING]
    }
});

await logs.send({
    embeds: [
        new EmbedBuilder()
        .setDescription(`🔴 Sesión cerrada por <@${i.user.id}>`)
        .setColor(0xe74c3c)
    ]
});

return i.update({
    components: [
        new ContainerBuilder()
            .setAccentColor(0xED4245)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("❌ Sesión cerrada correctamente.")
            )
    ],
    flags: MessageFlags.IsComponentsV2
});

}
// 🛠️ MANTENIMIENTO
  if (i.customId === "mantenimiento") {

const mantenimiento = new ContainerBuilder()
.setAccentColor(0xFEE75C) // amarillo Discord

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
    )
)

.addSectionComponents(
    new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
`# 🛠️ Servidor en Mantenimiento

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> ⚙️ El servidor se encuentra actualmente
> en mantenimiento oficial.

> ⏳ Estado: \`\`\`EN PROGRESO\`\`\`

> 🔧 Se están realizando mejoras,
> ajustes y optimizaciones.
╰━━━━━━━━━━━━━━━━╯

### ⚠️ Recomendaciones
• Evitar acciones dentro del servidor
• Esperar indicaciones del staff
• Mantenerse atentos a anuncios oficiales

📢 La reapertura será anunciada oficialmente.

🔥 Trabajamos para darte una mejor experiencia 🔥`
            )
        )

        .setThumbnailAccessory(
            new ThumbnailBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png")
        )
)

.addSeparatorComponents(
    new SeparatorBuilder()
)

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`🌐 **PANAMÁ RP V2**
### Sistema Oficial del Servidor

> Mantenimiento activo • Administración oficial`
    )
)

.addMediaGalleryComponents(
  new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder()
      .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509754798315012358/17688135.gif?ex=6a1a5439&is=6a1902b9&hm=16d67219d9af970d0103769fbfcfad61a28d5ed263734c9a015c5e42b8b4621b&")
  )
);

await canal.send({
    components: [mantenimiento],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: {
        roles: [ROL_PING]
    }
});

return i.update({
    components: [
        new ContainerBuilder()
            .setAccentColor(0xFEE75C)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("🛠️ Mantenimiento activado correctamente.")
            )
    ],
    flags: MessageFlags.IsComponentsV2
});

  }  
// 🗳️ VOTACIÓN (ARREGLADO)
if (i.customId === "votar") {

if (votacionActiva) {
return i.reply({
content: "❌ Ya hay una votación activa.",
ephemeral: true
});
}

votacionActiva = true;
votos.clear();

const votacion = new ContainerBuilder()
.setAccentColor(0xF1C40F)

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
    )
)

.addSectionComponents(
    new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
`# 📢 Sesión de Votación

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> 🗳️ La votación ha sido iniciada oficialmente.

> 📊 Votos requeridos:
\`\`\`0/8\`\`\`

> 👥 Votantes:
\`\`\`
Aún no hay votos registrados.
\`\`\`

> ⏳ Tiempo restante:
\`\`\`20 minutos\`\`\`
╰━━━━━━━━━━━━━━━━╯

### ⚠️ Indicaciones
• Solo se permite un voto por usuario
• El mismo botón sirve para quitar voto
• Mantener el respeto en el chat
• La decisión es democrática

🔥 ¡Tu voz tiene poder, hazla valer! 🔥`
            )
        )

        .setThumbnailAccessory(
            new ThumbnailBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png")
        )
)

.addSeparatorComponents(
    new SeparatorBuilder()
)

.addActionRowComponents(
    new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("votar_si")
            .setLabel("✅ Votar / Quitar voto")
            .setStyle(ButtonStyle.Success)
    )
)

.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
`🌐 **PANAMÁ RP V2**
### Sistema Oficial de Votaciones

> Participación democrática • Administración oficial`
    )
)

.addMediaGalleryComponents(
  new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder()
      .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509756643548725288/11-00-13-565_512.gif?ex=6a1a55f1&is=6a190471&hm=e91668b6d3aae2e5ad582640c9cd41565599495440858fad763b6a279d5a61e3&")
  )
);

const msg = await canal.send({
components: [votacion],
flags: MessageFlags.IsComponentsV2,
allowedMentions: {
roles: [ROL_PING]
}
});

// ✅ FIX REAL
const collectorV = msg.createMessageComponentCollector({
time: 20 * 60 * 1000,
filter: btn => btn.customId === "votar_si"
});

collectorV.on("collect", async btn => {

// ✅ QUITAR VOTO
if (votos.has(btn.user.id)) {

votos.delete(btn.user.id);

const listaQuitada = votos.size
? [...votos].map(id => `<@${id}>`).join("\n")
: "Aún no hay votos registrados.";

const votacionActualizada = new ContainerBuilder()
.setAccentColor(0xF1C40F)

.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
)
)

.addSectionComponents(
new SectionBuilder()
.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`# 📢 Sesión de Votación

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> 🗳️ La votación continúa activa.

> 📊 Votos requeridos:
\`\`\`${votos.size}/8\`\`\`

> 👥 Votantes:
\`\`\`
${listaQuitada}
\`\`\`

> ⏳ Tiempo restante:
\`\`\`En curso\`\`\`
╰━━━━━━━━━━━━━━━━╯

⚠️ Puedes volver a votar usando el botón.

🔥 ¡Tu voz tiene poder! 🔥`
)
)

.setThumbnailAccessory(
new ThumbnailBuilder()
.setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png")
)
)

.addSeparatorComponents(
new SeparatorBuilder()
)

.addActionRowComponents(
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("votar_si")
.setLabel("✅ Votar / Quitar voto")
.setStyle(ButtonStyle.Success)
)
);

await msg.edit({
components: [votacionActualizada],
flags: MessageFlags.IsComponentsV2
});

return btn.reply({
content: "❌ Quitaste tu voto.",
ephemeral: true
});

}

// ✅ AGREGAR VOTO
votos.add(btn.user.id);

const lista = [...votos].map(id => `<@${id}>`).join("\n");

const votacionActualizada = new ContainerBuilder()
.setAccentColor(0xF1C40F)

.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
)
)

.addSectionComponents(
new SectionBuilder()
.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`# 📢 Sesión de Votación

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> 🗳️ La votación continúa activa.

> 📊 Votos requeridos:
\`\`\`${votos.size}/8\`\`\`

> 👥 Votantes:
\`\`\`
${lista}
\`\`\`

> ⏳ Tiempo restante:
\`\`\`En curso\`\`\`
╰━━━━━━━━━━━━━━━━╯

🔥 ¡Tu voto decide el futuro del servidor! 🔥`
)
)

.setThumbnailAccessory(
new ThumbnailBuilder()
.setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png")
)
)

.addSeparatorComponents(
new SeparatorBuilder()
)

.addActionRowComponents(
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("votar_si")
.setLabel("✅ Votar / Quitar voto")
.setStyle(ButtonStyle.Success)
)
);

await msg.edit({
components: [votacionActualizada],
flags: MessageFlags.IsComponentsV2
});

await btn.reply({
content: "✅ Votaste correctamente.",
ephemeral: true
});

if (votos.size >= 8) {
collectorV.stop();
}

});

collectorV.on("end", async () => {

votacionActiva = false;

// ✅ DESACTIVAR BOTÓN
await msg.edit({
components: [
new ContainerBuilder()
.setAccentColor(0x95A5A6)

.addSectionComponents(
new SectionBuilder()
.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`# 🔒 Votación Finalizada

### 『PANAMÁ RP V2』

La sesión de votación ha terminado oficialmente.`
)
)
)
],
flags: MessageFlags.IsComponentsV2
});

// ✅ APROBADA
if (votos.size >= 8) {

const aprobado = new ContainerBuilder()
.setAccentColor(0x57F287)

.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`<@&${ROL_PING}>`
)
)

.addSectionComponents(
new SectionBuilder()
.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`# 🟢 Sesión Aprobada

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> 🎉 Se alcanzaron los votos necesarios.

> ✅ El servidor queda oficialmente abierto.

> ⏳ Tienen 10 minutos para ingresar.
╰━━━━━━━━━━━━━━━━╯

🔥 ¡El roleplay comienza ahora! 🔥`
)
)
);

await canal.send({
components: [aprobado],
flags: MessageFlags.IsComponentsV2,
allowedMentions: {
roles: [ROL_PING]
}
});

} else {

// ❌ RECHAZADA
const rechazada = new ContainerBuilder()
.setAccentColor(0xED4245)

.addSectionComponents(
new SectionBuilder()
.addTextDisplayComponents(
new TextDisplayBuilder().setContent(
`# 🔒 Votación Finalizada

### 『PANAMÁ RP V2』

╭━━━━━━━━━━━━━━━━╮
> ❌ No se alcanzaron los votos necesarios.

> 📊 Resultado:
\`\`\`${votos.size}/8\`\`\`
╰━━━━━━━━━━━━━━━━╯

🔥 Gracias por participar.`
)
)
);

await canal.send({
components: [rechazada],
flags: MessageFlags.IsComponentsV2
});

}

// 📊 LOGS
await logs.send({
embeds: [
new EmbedBuilder()
.setTitle("📊 LOG VOTACIÓN")
.setDescription(
`👥 Votos finales: ${votos.size}/8\n🛡️ Responsable: <@${i.user.id}>`
)
.setColor(0xF1C40F)
]
});

});

// ✅ RESPUESTA PANEL
return i.update({
components: [
new ContainerBuilder()
.setAccentColor(0xF1C40F)
.addTextDisplayComponents(
new TextDisplayBuilder()
.setContent("🗳️ Votación iniciada correctamente.")
)
],
flags: MessageFlags.IsComponentsV2
});
}
