const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    StringSelectMenuBuilder
} = require("discord.js");

// 📂 Categoría
const CATEGORIA_ID = "1463192293111763113";

// 📂 Canal del panel
const CANAL_PANEL = "1463192291211477008";

// 🧠 Memoria
const ticketsAbiertos = new Map();
const contadores = {
    soporte: 0,
    usuario: 0,
    staff: 0,
    alianza: 0,
    fundacion: 0
};

module.exports = (client) => {

    // ==============================
    // 🚀 PANEL AUTOMÁTICO
    // ==============================
    client.once("ready", async () => {

        const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
        if (!canal) return;

        const embed = new EmbedBuilder()
            .setColor("#111214") // 🔥 color oscuro tipo Discord moderno
            .setTitle("Sistema de Tickets")
            .setDescription(
`Selecciona una opción del menú para abrir un ticket.

━━━━━━━━━━━━━━━━━━

Soporte General  
Reportar Usuario  
Reportar Staff  
Alianza  
Fundación

━━━━━━━━━━━━━━━━━━

Nuestro equipo te responderá lo antes posible.`
            )
            .setFooter({
                text: "Los Santos RP • Soporte",
            });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Selecciona una opción")
            .addOptions([
                {
                    label: "Soporte General",
                    value: "soporte",
                    description: "Ayuda general del servidor"
                },
                {
                    label: "Reportar Usuario",
                    value: "usuario",
                    description: "Reportar comportamiento"
                },
                {
                    label: "Reportar Staff",
                    value: "staff",
                    description: "Asuntos internos"
                },
                {
                    label: "Alianza",
                    value: "alianza",
                    description: "Solicitudes de alianza"
                },
                {
                    label: "Fundación",
                    value: "fundacion",
                    description: "Soporte administrativo"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await canal.send({
            embeds: [embed],
            components: [row]
        });

        console.log("✅ Panel moderno enviado");
    });

    // ==============================
    // 🎫 CREAR TICKET
    // ==============================
    client.on("interactionCreate", async interaction => {

        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

            const user = interaction.user;
            const guild = interaction.guild;
            const tipo = interaction.values[0];

            if (ticketsAbiertos.has(user.id)) {
                return interaction.reply({
                    content: "Ya tienes un ticket abierto.",
                    ephemeral: true
                });
            }

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

            // 🔔 Ping
            const pings = roles.map(r => `<@&${r}>`).join(" ");
            await canal.send(`${pings} <@${user.id}>`);

            // 🔥 EMBED MODERNO DEL TICKET
            const embedTicket = new EmbedBuilder()
                .setColor("#111214")
                .setTitle("Ticket creado")
                .setDescription(
`Hola <@${user.id}>

Tu ticket ha sido creado correctamente.
Un miembro del staff te atenderá en breve.`
                )
                .setFooter({
                    text: "Sistema de Soporte"
                });

            const botones = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("reclamar")
                    .setLabel("Reclamar")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("cerrar")
                    .setLabel("Cerrar")
                    .setStyle(ButtonStyle.Danger)
            );

            await canal.send({
                embeds: [embedTicket],
                components: [botones]
            });

            await interaction.reply({
                content: `Ticket creado: ${canal}`,
                ephemeral: true
            });
        }

        // ==============================
        // 🔘 BOTONES
        // ==============================
        if (interaction.isButton()) {

            const canal = interaction.channel;

            if (interaction.customId === "reclamar") {
                return interaction.reply(`Ticket reclamado por <@${interaction.user.id}>`);
            }

            if (interaction.customId === "cerrar") {

                for (const [userId, canalId] of ticketsAbiertos.entries()) {
                    if (canalId === canal.id) {
                        ticketsAbiertos.delete(userId);
                        break;
                    }
                }

                await interaction.reply("Cerrando ticket...");
                setTimeout(() => canal.delete(), 3000);
            }
        }

    });

};
