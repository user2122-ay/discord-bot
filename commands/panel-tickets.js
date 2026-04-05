const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} = require("discord.js");

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
    "1463192290456764547",
    "1463192290456764545"
];

module.exports["panel-tickets"] = {
    permisos: "👑 Fundación",

    data: new SlashCommandBuilder()
        .setName("panel-tickets")
        .setDescription("Enviar panel de tickets")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const tieneRol = interaction.member.roles.cache.some(r =>
            ROLES_FUNDACION.includes(r.id)
        );

        if (!tieneRol) {
            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });
        }

        // 📌 EMBED COMPLETO (EL TUYO)
        const embed = new EmbedBuilder()
            .setColor("#2c2f33")
            .setTitle("🎫┃SISTEMA DE TICKETS")
            .setDescription(`Bienvenido/a al **Sistema Oficial de Atención y Soporte** de **Los Santos Spanish. RP**.
Este panel ha sido creado para garantizar una gestión **ordenada, confidencial y eficiente** de todas las solicitudes de la comunidad.

Seleccione cuidadosamente la categoría que mejor se ajuste a su situación.
Un miembro del **staff autorizado** atenderá su ticket a la mayor brevedad posible.

---
📌 **Categorías Disponibles**

<:moderador:1463940895698325708> **SOPORTE GENERAL**
<:admind:1463940988530589902> **REPORTAR USUARIO**
<:emoji_5:1463941230294597773> **REPORTAR STAFF**
<a:Alianza:1463941043870371891> **ALIANZA**
<:owner:1463941136229077033> **SOPORTE FUNDACIÓN**

---

⚠️ Uso indebido = sanción.`)
            .setFooter({ text: "Sistema de Tickets • Los Santos RP" });

        // 📌 MENÚ CON TUS EMOJIS
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Selecciona una categoría")
            .addOptions([
                {
                    label: "Soporte General",
                    value: "soporte",
                    emoji: "1463940895698325708"
                },
                {
                    label: "Reportar Usuario",
                    value: "usuario",
                    emoji: "1463940988530589902"
                },
                {
                    label: "Reportar Staff",
                    value: "staff",
                    emoji: "1463941230294597773"
                },
                {
                    label: "Alianza",
                    value: "alianza",
                    emoji: "1463941043870371891"
                },
                {
                    label: "Soporte Fundación",
                    value: "fundacion",
                    emoji: "1463941136229077033"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // 📤 ENVÍA EN EL MISMO CANAL
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        return interaction.reply({
            content: "✅ Panel enviado.",
            ephemeral: true
        });
    }
};
