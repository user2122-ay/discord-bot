const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

// 📂 Categoría donde se crean
const CATEGORIA_ID = "1463192293111763113";

// 🧠 Memoria temporal
const ticketsAbiertos = new Map();
const contadores = {
    soporte: 0,
    usuario: 0,
    staff: 0,
    alianza: 0,
    fundacion: 0
};

module.exports = (client) => {

    client.on("interactionCreate", async interaction => {

        // ==============================
        // 📌 CREAR TICKET
        // ==============================
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

            const user = interaction.user;
            const guild = interaction.guild;
            const tipo = interaction.values[0];

            // 🔒 1 ticket por usuario
            if (ticketsAbiertos.has(user.id)) {
                return interaction.reply({
                    content: "❌ Ya tienes un ticket abierto.",
                    ephemeral: true
                });
            }

            // 🔢 contador
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

            // 📁 Crear canal
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

            // 📢 Ping fuera del embed
            const pings = roles.map(r => `<@&${r}>`).join(" ");

            await canal.send(`${pings} <@${user.id}>`);

            // 📌 EMBED
            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🎫 Ticket abierto")
                .setDescription(`Hola <@${user.id}>, un staff te atenderá pronto.`);

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
                content: `✅ Ticket creado: ${canal}`,
                ephemeral: true
            });
        }

        // ==============================
        // 🔘 BOTONES
        // ==============================
        if (interaction.isButton()) {

            const canal = interaction.channel;

            // 🔒 RECLAMAR
            if (interaction.customId === "reclamar") {

                await canal.permissionOverwrites.edit(interaction.user.id, {
                    ViewChannel: true,
                    SendMessages: true
                });

                return interaction.reply(`👮 Ticket reclamado por <@${interaction.user.id}>`);
            }

            // ❌ CERRAR
            if (interaction.customId === "cerrar") {

                // quitar de memoria
                for (const [userId, canalId] of ticketsAbiertos.entries()) {
                    if (canalId === canal.id) {
                        ticketsAbiertos.delete(userId);
                        break;
                    }
                }

                await interaction.reply("🔒 Cerrando ticket...");

                setTimeout(() => canal.delete(), 3000);
            }

        }

    });

};
