const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

const fs   = require("fs");
const path = require("path");

// ðŸ“‚ CategorÃ­a donde se crean
const CATEGORIA_ID = "1463192293111763113";

// ðŸ“„ Archivo para recordar el mensaje del panel
const PANEL_FILE = path.join(__dirname, "../panel-id.json");

// ðŸ§  Memoria temporal
const ticketsAbiertos = new Map();
const contadores = {
    soporte: 0,
    usuario: 0,
    staff: 0,
    alianza: 0,
    fundacion: 0
};

function leerPanel() {
    try {
        if (fs.existsSync(PANEL_FILE)) return JSON.parse(fs.readFileSync(PANEL_FILE, "utf8"));
    } catch (_) {}
    return null;
}

function guardarPanel(data) {
    fs.writeFileSync(PANEL_FILE, JSON.stringify(data, null, 2), "utf8");
}

module.exports = (client) => {

    // ==============================
    // ðŸ·ï¸ PANEL â€” solo una vez
    // ==============================
    client.once("ready", async () => {
        const CANAL_PANEL_ID = "PON_AQUI_EL_ID_DEL_CANAL";

        try {
            const canal = await client.channels.fetch(CANAL_PANEL_ID);
            const guardado = leerPanel();

            if (guardado?.mensajeId) {
                try {
                    await canal.messages.fetch(guardado.mensajeId);
                    console.log("[Tickets] Panel ya existe, no se reenvÃ­a.");
                    return;
                } catch (_) {
                    console.log("[Tickets] Mensaje borrado, reenviando panel...");
                }
            }

            const embed = new EmbedBuilder()
                .setColor("#F0A500")
                .setTitle("ðŸ·ï¸ | Panel de Tickets")
                .setDescription(
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    "Â¡Bienvenidos al sistema oficial de Tickets de MedellÃ­n RP!\n" +
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    "Antes de abrir ticket por lo que sea, pregunte. Si nadie es " +
                    "capaz de responderte, abre y te resolveremos.\n" +
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    "Nuestro tiempo estimado de respuesta es de menos de 6 horas. " +
                    "Hay varios tipos de tickets que puedes tener:\n\n" +
                    "â— FundaciÃ³n\n" +
                    "â— DirecciÃ³n\n" +
                    "â— AdministraciÃ³n\n" +
                    "â— ModeraciÃ³n\n" +
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    "Gracias a todos."
                );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("ticket_select")
                .setPlaceholder("Haz una selecciÃ³n")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("FundaciÃ³n")
                        .setDescription("Tickets relacionados con la fundaciÃ³n")
                        .setValue("fundacion")
                        .setEmoji("ðŸ›ï¸"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("DirecciÃ³n")
                        .setDescription("Tickets para direcciÃ³n")
                        .setValue("soporte")
                        .setEmoji("ðŸ“‹"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("AdministraciÃ³n")
                        .setDescription("Tickets de administraciÃ³n")
                        .setValue("alianza")
                        .setEmoji("âš™ï¸"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("ModeraciÃ³n")
                        .setDescription("Reportes y tickets de moderaciÃ³n")
                        .setValue("usuario")
                        .setEmoji("ðŸ›¡ï¸")
                );

            const fila = new ActionRowBuilder().addComponents(selectMenu);

            const mensaje = await canal.send({ embeds: [embed], components: [fila] });
            guardarPanel({ canalId: canal.id, mensajeId: mensaje.id });
            console.log("[Tickets] Panel enviado.");

        } catch (err) {
            console.error("[Tickets] Error enviando panel:", err.message);
        }
    });

    client.on("interactionCreate", async interaction => {

        // ==============================
        // ðŸ“Œ CREAR TICKET
        // ==============================
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

            const user = interaction.user;
            const guild = interaction.guild;
            const tipo = interaction.values[0];

            // ðŸ”’ 1 ticket por usuario
            if (ticketsAbiertos.has(user.id)) {
                return interaction.reply({
                    content: "âŒ Ya tienes un ticket abierto.",
                    ephemeral: true
                });
            }

            // ðŸ”¢ contador
            contadores[tipo]++;
            const numero = String(contadores[tipo]).padStart(3, "0");

            let nombre = "";
            let roles = [];

            if (tipo === "soporte") {
                nombre = `soporte-${numero}`;
                roles = ["1463192290423083324"];
            }

            if (tipo === "usuario") {
                nombre = `reporte-${numero}`;
                roles = ["1463192290423083324"];
            }

            if (tipo === "staff") {
                nombre = `staff-${numero}`;
                roles = ["1463192290444185650"];
            }

            if (tipo === "alianza") {
                nombre = `alianza-${numero}`;
                roles = ["1463192290410631451"];
            }

            if (tipo === "fundacion") {
                nombre = `fundacion-${numero}`;
                roles = ["1463192290456764549"];
            }

            // ðŸ“ Crear canal
            const canal = await guild.channels.create({
                name: nombre,
                type: ChannelType.GuildText,
                parent: CATEGORIA_ID,
                permissionOverwrites: [
                    { id: guild.id, deny: ["ViewChannel"] },
                    { id: user.id, allow: ["ViewChannel", "SendMessages"] },
                    ...roles.map(r => ({
                        id: r,
                        allow: ["ViewChannel", "SendMessages"]
                    }))
                ]
            });

            ticketsAbiertos.set(user.id, canal.id);

            // ðŸ“¢ Ping fuera del embed
            const pings = roles.map(r => `<@&${r}>`).join(" ");

            await canal.send(`${pings} <@${user.id}>`);

            // ðŸ“Œ EMBED (nuevo estilo)
            const embed = new EmbedBuilder()
                .setColor("#F0A500")
                .setTitle("ðŸŽ« | Ticket abierto")
                .setDescription(
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    `Hola <@${user.id}>, un miembro del staff te atenderÃ¡ pronto.\n` +
                    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n" +
                    "Describe tu situaciÃ³n con el mayor detalle posible."
                );

            const botones = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("reclamar")
                    .setLabel("Reclamar")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("cerrar")
                    .setLabel("Cerrar")
                    .setStyle(ButtonStyle.Danger)
            );

            await canal.send({
                embeds: [embed],
                components: [botones]
            });

            await interaction.reply({
                content: `âœ… Ticket creado: ${canal}`,
                ephemeral: true
            });
        }

        // ==============================
        // ðŸ”˜ BOTONES
        // ==============================
        if (interaction.isButton()) {

            const canal = interaction.channel;

            // ðŸ”’ RECLAMAR
            if (interaction.customId === "reclamar") {

                await canal.permissionOverwrites.edit(interaction.user.id, {
                    ViewChannel: true,
                    SendMessages: true
                });

                return interaction.reply(`ðŸ‘® Ticket reclamado por <@${interaction.user.id}>`);
            }

            // âŒ CERRAR
            if (interaction.customId === "cerrar") {

                // quitar de memoria
                for (const [userId, canalId] of ticketsAbiertos.entries()) {
                    if (canalId === canal.id) {
                        ticketsAbiertos.delete(userId);
                        break;
                    }
                }

                await interaction.reply("ðŸ”’ Cerrando ticket...");

                setTimeout(() => canal.delete(), 3000);
            }

        }

    });

};
