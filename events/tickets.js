const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    StringSelectMenuBuilder
} = require("discord.js");

// 📂 Categoría donde se crean
const CATEGORIA_ID = "1459214153326657559";

// 📂 Canal del panel
const CANAL_PANEL = "1451018705528946923";

// 👑 TU ID
const OWNER_ID = "1451018301831385241";

// 🧠 Memoria temporal
const ticketsAbiertos = new Map();
const ticketsReclamados = new Map(); // 🔥 NUEVO

const contadores = {
    soporte: 0,
    usuario: 0,
    staff: 0,
    alianza: 0,
    fundacion: 0
};

// 🔐 ROLES POR TIPO
const ROLES_TICKET = {
    soporte: ["1451018406537986168"],
    usuario: ["1451018406537986168"],
    staff: ["1451018321033036068"],
    alianza: ["1451218087910309898"],
    fundacion: ["1497437860608081950"]
};

module.exports = (client) => {

    // ==============================
    // 📌 COMANDO !panel
    // ==============================
    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;
        if (message.content !== "!panel") return;

        if (message.author.id !== OWNER_ID) {
            return message.reply("❌ No puedes usar este comando.");
        }

        const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
        if (!canal) return message.reply("❌ Canal no encontrado.");

        const mensajes = await canal.messages.fetch({ limit: 100 });
        await canal.bulkDelete(mensajes, true);

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎫┃SISTEMA DE TICKETS")
        .setDescription(
`Bienvenido/a al **Sistema Oficial de Atención y Soporte** de **Velaryon Spanish RP**.

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

        await canal.send({
            embeds: [embed],
            components: [row]
        });

        message.reply("✅ Panel enviado.");
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

            const nombre = `${tipo}-${numero}`;
            const roles = ROLES_TICKET[tipo];

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
                .setColor("#5865F2")
                .setTitle("🎫 Ticket abierto")
                .setDescription(`Hola <@${user.id}>, espera a un staff.`);

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

                // ❌ Ya reclamado
                if (ticketsReclamados.has(canal.id)) {
                    return interaction.reply({
                        content: "❌ Este ticket ya fue reclamado.",
                        ephemeral: true
                    });
                }

                // 🔍 Detectar tipo por nombre
                const tipo = canal.name.split("-")[0];
                const rolesPermitidos = ROLES_TICKET[tipo] || [];

                // 🔒 Verificar rol
                const tieneRol = interaction.member.roles.cache.some(r =>
                    rolesPermitidos.includes(r.id)
                );

                if (!tieneRol) {
                    return interaction.reply({
                        content: "❌ No tienes permiso para reclamar este ticket.",
                        ephemeral: true
                    });
                }

                // ✅ Guardar reclamador
                ticketsReclamados.set(canal.id, interaction.user.id);

                await canal.send(`👮 Ticket reclamado por <@${interaction.user.id}>`);

                return interaction.reply({
                    content: "✅ Ticket reclamado.",
                    ephemeral: true
                });
            }

            // ❌ CERRAR
            if (interaction.customId === "cerrar") {

                const tipo = canal.name.split("-")[0];
                const rolesPermitidos = ROLES_TICKET[tipo] || [];

                const esStaff = interaction.member.roles.cache.some(r =>
                    rolesPermitidos.includes(r.id)
                );

                if (!esStaff) {
                    return interaction.reply({
                        content: "❌ Solo el staff puede cerrar este ticket.",
                        ephemeral: true
                    });
                }

                for (const [userId, canalId] of ticketsAbiertos.entries()) {
                    if (canalId === canal.id) {
                        ticketsAbiertos.delete(userId);
                        break;
                    }
                }

                ticketsReclamados.delete(canal.id);

                await interaction.reply("🔒 Cerrando ticket...");
                setTimeout(() => canal.delete(), 3000);
            }
        }

    });

};
