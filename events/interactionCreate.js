const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// 🔌 CONEXIÓN A POSTGRES
const { pool } = require("../database");

module.exports = async (interaction) => {

    /* ================= SELECT MENU ================= */

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "ticket_select") {

            const tipo = interaction.values[0];
            const userId = interaction.user.id;

            // 🔢 Obtener número de ticket
            const res = await pool.query(`SELECT MAX(numero) FROM tickets`);
            const numero = (res.rows[0].max || 0) + 1;
            const numeroFormateado = String(numero).padStart(3, "0");

            let nombre = "";
            let roles = [];

            if (tipo === "soporte") {
                nombre = `soporte-${numeroFormateado}`;
                roles = ["1463192290423083324"];
            }

            if (tipo === "usuario") {
                nombre = `reporte-${numeroFormateado}`;
                roles = ["1463192290423083324"];
            }

            if (tipo === "staff") {
                nombre = `staff-${numeroFormateado}`;
                roles = ["1463192290444185650"];
            }

            if (tipo === "alianza") {
                nombre = `alianza-${numeroFormateado}`;
                roles = ["1463192290410631451"];
            }

            if (tipo === "fundacion") {
                nombre = `fundacion-${numeroFormateado}`;
                roles = ["1463192290456764545", "1463192290456764547"];
            }

            // 📁 Crear canal
            const channel = await interaction.guild.channels.create({
                name: nombre,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: userId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    ...roles.map(r => ({
                        id: r,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }))
                ]
            });

            // 💾 Guardar en BD
            await pool.query(`
                INSERT INTO tickets (user_id, channel_id, tipo, numero, estado)
                VALUES ($1, $2, $3, $4, 'abierto')
            `, [userId, channel.id, tipo, numero]);

            // ✅ Respuesta
            await interaction.reply({
                content: `✅ Ticket creado: ${channel}`,
                ephemeral: true
            });

            // 🔔 Ping
            await channel.send(`${roles.map(r => `<@&${r}>`).join(" ")} <@${userId}>`);

            // 📩 Mensaje
            const embed = new EmbedBuilder()
                .setColor("#00ff88")
                .setTitle("🎫 Ticket creado")
                .setDescription("Un miembro del staff te atenderá pronto.");

            const botones = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("claim")
                    .setLabel("Reclamar")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("close")
                    .setLabel("Cerrar")
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                embeds: [embed],
                components: [botones]
            });
        }
    }

    /* ================= BOTONES ================= */

    if (interaction.isButton()) {

        const logChannel = interaction.guild.channels.cache.get("1463192293312958630");

        // 🔵 CLAIM
        if (interaction.customId === "claim") {

            await interaction.reply({ content: "✅ Ticket reclamado", ephemeral: true });

            await interaction.channel.send(`👤 Ticket reclamado por ${interaction.user}`);

            await logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("📌 Ticket reclamado")
                        .setDescription(`${interaction.user} reclamó ${interaction.channel}`)
                ]
            });
        }

        // 🔴 CLOSE
        if (interaction.customId === "close") {

            let messages = await interaction.channel.messages.fetch({ limit: 100 });
            messages = messages.reverse();

            let contenido = messages.map(m =>
                `${m.author.tag}: ${m.content}`
            ).join("\n");

            const fs = require("fs");
            const path = require("path");

            const filePath = path.join(__dirname, `../transcript-${interaction.channel.id}.txt`);
            fs.writeFileSync(filePath, contenido);

            await pool.query(`
                UPDATE tickets
                SET estado = 'cerrado'
                WHERE channel_id = $1
            `, [interaction.channel.id]);

            await logChannel.send({
                files: [filePath],
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("📁 Ticket cerrado")
                        .setDescription(`Canal: ${interaction.channel.name}`)
                ]
            });

            await interaction.reply({ content: "🔒 Cerrando ticket..." });

            setTimeout(() => {
                interaction.channel.delete();
            }, 3000);
        }
    }
};
