const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// 📜 CANAL LOGS
const CANAL_LOGS = "1463192293312958630";

module.exports = (client) => {

    client.on("interactionCreate", async interaction => {

        // =========================
        // 🎫 CREAR TICKET
        // =========================
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

            const categoria = interaction.values[0];
            const user = interaction.user;
            const guild = interaction.guild;

            // 🔢 CONTADOR MEJORADO
            const tickets = guild.channels.cache.filter(c =>
                c.name.startsWith("soporte") ||
                c.name.startsWith("staff") ||
                c.name.startsWith("alianza") ||
                c.name.startsWith("fundacion")
            );

            const numero = String(tickets.size + 1).padStart(3, "0");

            let nombre = "";
            let roles = [];

            if (categoria === "soporte" || categoria === "usuario") {
                nombre = `soporte-${numero}`;
                roles = ["1463192290423083324"];
            }

            if (categoria === "staff") {
                nombre = `staff-${numero}`;
                roles = ["1463192290444185650"];
            }

            if (categoria === "alianza") {
                nombre = `alianza-${numero}`;
                roles = ["1463192290410631451"];
            }

            if (categoria === "fundacion") {
                nombre = `fundacion-${numero}`;
                roles = [
                    "1463192290456764545",
                    "1463192290456764547"
                ];
            }

            const canal = await guild.channels.create({
                name: nombre,
                type: 0,
                permissionOverwrites: [
                    { id: guild.id, deny: ["ViewChannel"] },
                    { id: user.id, allow: ["ViewChannel", "SendMessages"] },
                    ...roles.map(r => ({
                        id: r,
                        allow: ["ViewChannel", "SendMessages"]
                    }))
                ]
            });

            const pings = roles.map(r => `<@&${r}>`).join(" ");

            // 📌 EMBED INICIAL
            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🎫 Ticket Abierto")
                .setDescription(`Hola <@${user.id}>\nUn staff te atenderá pronto.`)
                .setFooter({ text: `ID Ticket: ${numero}` });

            // 🔘 BOTONES
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

            await canal.send(`${pings} <@${user.id}>`);
            await canal.send({ embeds: [embed], components: [botones] });

            await interaction.reply({
                content: `✅ Ticket creado: ${canal}`,
                ephemeral: true
            });

            return;
        }

        // =========================
        // 👮 RECLAMAR
        // =========================
        if (interaction.isButton() && interaction.customId === "reclamar") {

            const member = interaction.member;

            if (!member.roles.cache.some(r =>
                ["1463192290423083324", "1463192290444185650", "1463192290410631451", "1463192290456764545"].includes(r.id)
            )) {
                return interaction.reply({ content: "❌ No puedes reclamar.", ephemeral: true });
            }

            await interaction.reply({
                content: `👮 ${interaction.user} ha reclamado este ticket.`,
            });

            return;
        }

        // =========================
        // ❌ CERRAR
        // =========================
        if (interaction.isButton() && interaction.customId === "cerrar") {

            const canal = interaction.channel;
            const logs = interaction.guild.channels.cache.get(CANAL_LOGS);

            // 📜 TRANSCRIPCIÓN SIMPLE
            const mensajes = await canal.messages.fetch({ limit: 100 });
            const contenido = mensajes
                .map(m => `${m.author.tag}: ${m.content}`)
                .reverse()
                .join("\n");

            if (logs) {
                logs.send({
                    content: `📁 Ticket cerrado: ${canal.name}\n\n${contenido.slice(0, 1900)}`
                });
            }

            await interaction.reply("🔒 Cerrando ticket...");
            setTimeout(() => canal.delete(), 3000);
        }

    });

};
