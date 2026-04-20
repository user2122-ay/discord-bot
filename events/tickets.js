const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// 📂 Categoría donde se crean
const CATEGORIA_ID = "1463192293111763113";

// 📂 Canal del panel
const CANAL_PANEL = "1463192291211477008";

// 💾 Archivo donde se guarda el ID del panel
const panelPath = path.join(__dirname, "../panelTicket.json");

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

    // ==============================
    // 🚀 PANEL INTELIGENTE (NO DUPLICA)
    // ==============================
    client.once("ready", async () => {

        const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
        if (!canal) return;

        let data = { mensajeId: null };

        if (fs.existsSync(panelPath)) {
            try {
                data = JSON.parse(fs.readFileSync(panelPath, "utf8"));
            } catch {
                data = { mensajeId: null };
            }
        }

        let mensajeExiste = false;

        if (data.mensajeId) {
            try {
                const msg = await canal.messages.fetch(data.mensajeId);
                if (msg) mensajeExiste = true;
            } catch {
                mensajeExiste = false;
            }
        }

        // ❌ Si ya existe, no hacer nada
        if (mensajeExiste) {
            console.log("🟡 Panel ya existe");
            return;
        }

        // ✅ Crear panel
        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("🎫┃SISTEMA DE TICKETS")
            .setDescription(
`Bienvenido/a al **Sistema Oficial de Atención y Soporte** de **Los Santos Spanish RP**.

Seleccione cuidadosamente la categoría que mejor se ajuste a su situación.

━━━━━━━━━━━━━━━━━━

<:moderador:1463940895698325708> **SOPORTE GENERAL**
<:admind:1463940988530589902> **REPORTAR USUARIO**
<:emoji_5:1463941230294597773> **REPORTAR STAFF**
<a:Alianza:1463941043870371891> **ALIANZA**
<:owner:1463941136229077033> **SOPORTE FUNDACIÓN**

━━━━━━━━━━━━━━━━━━

⚠️ Uso indebido = sanción.`
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Selecciona una opción")
            .addOptions([
                { label: "Soporte General", value: "soporte" },
                { label: "Reportar Usuario", value: "usuario" },
                { label: "Reportar Staff", value: "staff" },
                { label: "Alianza", value: "alianza" },
                { label: "Fundación", value: "fundacion" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const mensaje = await canal.send({
            embeds: [embed],
            components: [row]
        });

        fs.writeFileSync(panelPath, JSON.stringify({
            mensajeId: mensaje.id
        }, null, 2));

        console.log("✅ Panel creado");
    });

    // ==============================
    // 📌 CREAR TICKET
    // ==============================
    client.on("interactionCreate", async interaction => {

        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

            const user = interaction.user;
            const guild = interaction.guild;
            const tipo = interaction.values[0];

            if (ticketsAbiertos.has(user.id)) {
                return interaction.reply({
                    content: "❌ Ya tienes un ticket abierto.",
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

            const pings = roles.map(r => `<@&${r}>`).join(" ");
            await canal.send(`${pings} <@${user.id}>`);

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

            if (interaction.customId === "reclamar") {
                return interaction.reply(`👮 Ticket reclamado por <@${interaction.user.id}>`);
            }

            if (interaction.customId === "cerrar") {

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
